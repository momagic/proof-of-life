// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {ERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {IWorldID} from "./IWorldID.sol";
import {ByteHasher} from "./IWorldID.sol";

contract LIFE is Initializable, ERC20Upgradeable, UUPSUpgradeable, OwnableUpgradeable {
    IWorldID public worldId;
    
    // App ID and Action for proof-of-life
    string public constant APP_ID = "app_960683747d9e6074f64601c654c8775f";
    string public constant INCOGNITO_ACTION = "proof-of-life";
    
    // Group ID for orb verification (1 = orb verification only)
    uint256 public constant GROUP_ID = 1;
    
    // External nullifier hash (computed from app ID + action)
    uint256 internal externalNullifierHash;
    
    // Updated constants for LIFE token
    uint256 public constant CLAIM_FREQUENCY_SECONDS = 24 * 60 * 60; // 24 hours
    uint256 public constant DAILY_CLAIM_AMOUNT = 1 ether; // 1 token per day
    uint256 public constant SIGNING_BONUS = 1000 ether; // 1000 tokens signing bonus
    uint256 public constant DEV_PREMINT = 1000000 ether; // 1,000,000 tokens for dev wallet

    mapping(address => uint256) public lastMint;
    mapping(address => bool) public hasReceivedSigningBonus;
    mapping(address => string) public userRegion;
    mapping(address => uint256) public lifetimeCheckIns;
    
    // Nullifier tracking for sybil resistance
    mapping(uint256 => bool) internal nullifierHashes;

    // Authorized minters (Economy contract, etc.)
    mapping(address => bool) public authorizedMinters;

    event SigningBonusClaimed(address indexed user, uint256 amount, string region);
    event DailyRewardClaimed(address indexed user, uint256 amount, string region);
    event OrbVerificationCompleted(address indexed user, uint256 nullifierHash);
    event AuthorizedMinterAdded(address indexed minter);
    event AuthorizedMinterRemoved(address indexed minter);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        IWorldID _worldId,
        address _devWallet
    ) public initializer {
        __ERC20_init("LIFE", "LIFE");
        __UUPSUpgradeable_init();
        __Ownable_init(_devWallet);
        
        worldId = _worldId;
        
        // Compute external nullifier hash from app ID and action
        externalNullifierHash = ByteHasher.hashToField(abi.encodePacked(APP_ID, INCOGNITO_ACTION));
        
        // Pre-mint 1,000,000 LIFE tokens to dev wallet
        _mint(_devWallet, DEV_PREMINT);
    }

    /// @notice Claim LIFE tokens with World ID orb verification
    /// @param signal The signal (user's wallet address)
    /// @param root The Merkle root of the World ID tree
    /// @param nullifierHash The nullifier hash to prevent double-signaling
    /// @param proof The zero-knowledge proof
    /// @param region The user's region
    function claimWithOrbVerification(
        address signal,
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof,
        string memory region
    ) external {
        // Ensure signal matches sender (prevents address spoofing)
        require(signal == msg.sender, "Signal must be sender address");
        
        // Check if nullifier has been used before (prevents double-spending)
        require(!nullifierHashes[nullifierHash], "Nullifier already used");
        
        // Verify the World ID proof
        worldId.verifyProof(
            root,
            GROUP_ID,
            ByteHasher.hashToField(abi.encodePacked(signal)),
            nullifierHash,
            externalNullifierHash,
            proof
        );
        
        // Mark nullifier as used
        nullifierHashes[nullifierHash] = true;
        
        // Validate region input
        require(bytes(region).length > 0, "Region cannot be empty");
        require(bytes(region).length <= 100, "Region name too long");
        
        // Store or update user's region
        userRegion[msg.sender] = region;
        
        // Give signing bonus if user hasn't received it yet
        if (!hasReceivedSigningBonus[msg.sender]) {
            hasReceivedSigningBonus[msg.sender] = true;
            _mint(msg.sender, SIGNING_BONUS);
            emit SigningBonusClaimed(msg.sender, SIGNING_BONUS, region);
        }
        
        // Check if 24 hours have passed since last claim for daily reward
        require(
            lastMint[msg.sender] + CLAIM_FREQUENCY_SECONDS < block.timestamp,
            "Daily reward not available yet - wait 24 hours"
        );
        
        lastMint[msg.sender] = block.timestamp;
        lifetimeCheckIns[msg.sender]++;
        _mint(msg.sender, DAILY_CLAIM_AMOUNT);
        emit DailyRewardClaimed(msg.sender, DAILY_CLAIM_AMOUNT, region);
        emit OrbVerificationCompleted(msg.sender, nullifierHash);
    }

    /// @notice Legacy claim function (for backward compatibility)
    /// @param region The user's region
    function claim(string memory region) external {
        // Validate region input
        require(bytes(region).length > 0, "Region cannot be empty");
        require(bytes(region).length <= 100, "Region name too long");
        
        // Store or update user's region
        userRegion[msg.sender] = region;
        
        // Give signing bonus if user hasn't received it yet
        if (!hasReceivedSigningBonus[msg.sender]) {
            hasReceivedSigningBonus[msg.sender] = true;
            _mint(msg.sender, SIGNING_BONUS);
            emit SigningBonusClaimed(msg.sender, SIGNING_BONUS, region);
        }
        
        // Check if 24 hours have passed since last claim for daily reward
        require(
            lastMint[msg.sender] + CLAIM_FREQUENCY_SECONDS < block.timestamp,
            "Daily reward not available yet - wait 24 hours"
        );
        
        lastMint[msg.sender] = block.timestamp;
        lifetimeCheckIns[msg.sender]++;
        _mint(msg.sender, DAILY_CLAIM_AMOUNT);
        emit DailyRewardClaimed(msg.sender, DAILY_CLAIM_AMOUNT, region);
    }
    
    // Function for authorized contracts to mint tokens
    function mint(address to, uint256 amount) external {
        require(authorizedMinters[msg.sender], "Not authorized to mint");
        _mint(to, amount);
    }
    
    // Function to add authorized minter
    function addAuthorizedMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = true;
        emit AuthorizedMinterAdded(minter);
    }
    
    // Function to remove authorized minter
    function removeAuthorizedMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = false;
        emit AuthorizedMinterRemoved(minter);
    }
    
    // Function to check when user can claim next daily reward
    function timeUntilNextClaim(address user) external view returns (uint256) {
        if (lastMint[user] == 0) {
            return 0; // Can claim immediately
        }
        
        uint256 nextClaimTime = lastMint[user] + CLAIM_FREQUENCY_SECONDS;
        if (nextClaimTime <= block.timestamp) {
            return 0; // Can claim now
        }
        
        return nextClaimTime - block.timestamp;
    }
    
    // Function to check if user has received signing bonus
    function hasUserReceivedSigningBonus(address user) external view returns (bool) {
        return hasReceivedSigningBonus[user];
    }
    
    // Function to get user's region
    function getUserRegion(address user) external view returns (string memory) {
        return userRegion[user];
    }
    
    // Function to get user's lifetime check-ins
    function getLifetimeCheckIns(address user) external view returns (uint256) {
        return lifetimeCheckIns[user];
    }
    
    // Function to check if a nullifier has been used
    function isNullifierUsed(uint256 nullifierHash) external view returns (bool) {
        return nullifierHashes[nullifierHash];
    }
    
    // Function to get the group ID (always 1 for orb verification)
    function getGroupId() external pure returns (uint256) {
        return GROUP_ID;
    }
    
    // Function to get the external nullifier hash
    function getExternalNullifierHash() external view returns (uint256) {
        return externalNullifierHash;
    }
    
    // Function to update World ID router (only owner)
    function updateWorldIdRouter(IWorldID _worldId) external onlyOwner {
        worldId = _worldId;
    }

    // Required by UUPSUpgradeable
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}