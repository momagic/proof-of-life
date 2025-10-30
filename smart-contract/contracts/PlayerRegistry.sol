// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

interface ILIFE {
    function balanceOf(address account) external view returns (uint256);
    function getLifetimeCheckIns(address user) external view returns (uint256);
    function getUserRegion(address user) external view returns (string memory);
}

interface IProperty {
    function getTotalStatusPoints(address owner) external view returns (uint256);
    function balanceOf(address owner) external view returns (uint256);
}

interface ILimitedEdition {
    function getTotalStatusPoints(address owner) external view returns (uint256);
    function balanceOf(address owner) external view returns (uint256);
}

contract PlayerRegistry is Initializable, UUPSUpgradeable, OwnableUpgradeable {
    
    // Player data structure
    struct PlayerData {
        address playerAddress;
        string region;
        uint256 totalStatusScore;
        uint256 lifetimeCheckIns;
        uint256 lifeTokenBalance;
        uint256 propertiesOwned;
        uint256 limitedEditionsOwned;
        uint256 lastUpdated;
        bool isRegistered;
    }
    
    // Contract references
    ILIFE public lifeToken;
    IProperty public propertyContract;
    ILimitedEdition public limitedEditionContract;
    
    // Player data storage
    mapping(address => PlayerData) public players;
    mapping(string => address[]) public playersByRegion;
    address[] public allPlayers;
    
    // Leaderboard data
    mapping(string => address[]) public regionalLeaderboards;
    address[] public globalLeaderboard;
    
    // Season management
    uint256 public currentSeason;
    mapping(uint256 => mapping(address => uint256)) public seasonalScores;
    mapping(uint256 => address[]) public seasonalLeaderboards;
    
    // Status score weights (in basis points, 10000 = 100%)
    uint256 public lifeTokenWeight; // Weight for LIFE token balance
    uint256 public propertyWeight; // Weight for property status points
    uint256 public limitedEditionWeight; // Weight for limited edition status points
    uint256 public checkInWeight; // Weight for lifetime check-ins
    
    // Authorized updaters
    mapping(address => bool) public authorizedUpdaters;
    
    // Events
    event PlayerRegistered(address indexed player, string region);
    event PlayerDataUpdated(address indexed player, uint256 newStatusScore);
    event LeaderboardUpdated(uint256 season);
    event SeasonStarted(uint256 season);
    event WeightsUpdated(uint256 lifeWeight, uint256 propertyWeight, uint256 limitedWeight, uint256 checkInWeight);
    event AuthorizedUpdaterAdded(address indexed updater);
    event AuthorizedUpdaterRemoved(address indexed updater);
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    function initialize(
        address _owner,
        address _lifeToken,
        address _propertyContract,
        address _limitedEditionContract
    ) public initializer {
        __UUPSUpgradeable_init();
        __Ownable_init(_owner);
        
        lifeToken = ILIFE(_lifeToken);
        propertyContract = IProperty(_propertyContract);
        limitedEditionContract = ILimitedEdition(_limitedEditionContract);
        
        // Initialize default weights (total should be 10000 = 100%)
        lifeTokenWeight = 3000; // 30%
        propertyWeight = 4000; // 40%
        limitedEditionWeight = 2000; // 20%
        checkInWeight = 1000; // 10%
        
        currentSeason = 1;
    }
    
    function registerPlayer(address player) external {
        require(authorizedUpdaters[msg.sender] || msg.sender == owner(), "Not authorized to register players");
        require(!players[player].isRegistered, "Player already registered");
        
        string memory region = lifeToken.getUserRegion(player);
        require(bytes(region).length > 0, "Player must have a region set");
        
        players[player] = PlayerData({
            playerAddress: player,
            region: region,
            totalStatusScore: 0,
            lifetimeCheckIns: 0,
            lifeTokenBalance: 0,
            propertiesOwned: 0,
            limitedEditionsOwned: 0,
            lastUpdated: block.timestamp,
            isRegistered: true
        });
        
        allPlayers.push(player);
        playersByRegion[region].push(player);
        
        emit PlayerRegistered(player, region);
        
        // Update player data immediately after registration
        updatePlayerData(player);
    }
    
    function updatePlayerData(address player) public {
        require(players[player].isRegistered, "Player not registered");
        
        PlayerData storage playerData = players[player];
        
        // Get current data from contracts
        uint256 lifeBalance = lifeToken.balanceOf(player);
        uint256 propertyStatusPoints = propertyContract.getTotalStatusPoints(player);
        uint256 limitedEditionStatusPoints = limitedEditionContract.getTotalStatusPoints(player);
        uint256 lifetimeCheckIns = lifeToken.getLifetimeCheckIns(player);
        uint256 propertiesOwned = propertyContract.balanceOf(player);
        uint256 limitedEditionsOwned = limitedEditionContract.balanceOf(player);
        
        // Calculate total status score
        uint256 totalScore = calculateStatusScore(
            lifeBalance,
            propertyStatusPoints,
            limitedEditionStatusPoints,
            lifetimeCheckIns
        );
        
        // Update player data
        playerData.totalStatusScore = totalScore;
        playerData.lifetimeCheckIns = lifetimeCheckIns;
        playerData.lifeTokenBalance = lifeBalance;
        playerData.propertiesOwned = propertiesOwned;
        playerData.limitedEditionsOwned = limitedEditionsOwned;
        playerData.lastUpdated = block.timestamp;
        
        // Update seasonal score
        seasonalScores[currentSeason][player] = totalScore;
        
        emit PlayerDataUpdated(player, totalScore);
    }
    
    function calculateStatusScore(
        uint256 lifeBalance,
        uint256 propertyStatusPoints,
        uint256 limitedEditionStatusPoints,
        uint256 lifetimeCheckIns
    ) public view returns (uint256) {
        // Normalize LIFE balance (divide by 1e18 to get token amount, then scale)
        uint256 normalizedLifeBalance = (lifeBalance / 1e18) * lifeTokenWeight / 10000;
        
        // Property and limited edition points are already calculated
        uint256 normalizedPropertyPoints = propertyStatusPoints * propertyWeight / 10000;
        uint256 normalizedLimitedPoints = limitedEditionStatusPoints * limitedEditionWeight / 10000;
        
        // Check-in bonus (each check-in worth points based on weight)
        uint256 normalizedCheckInPoints = lifetimeCheckIns * checkInWeight / 10000;
        
        return normalizedLifeBalance + normalizedPropertyPoints + normalizedLimitedPoints + normalizedCheckInPoints;
    }
    
    function updateMultiplePlayerData(address[] calldata playerAddresses) external {
        require(authorizedUpdaters[msg.sender] || msg.sender == owner(), "Not authorized to update player data");
        
        for (uint256 i = 0; i < playerAddresses.length; i++) {
            if (players[playerAddresses[i]].isRegistered) {
                updatePlayerData(playerAddresses[i]);
            }
        }
    }
    
    function getGlobalLeaderboard(uint256 limit) external view returns (address[] memory, uint256[] memory) {
        require(limit > 0 && limit <= 100, "Limit must be between 1 and 100");
        
        address[] memory topPlayers = new address[](limit);
        uint256[] memory topScores = new uint256[](limit);
        
        // Simple bubble sort for top players (inefficient but works for small datasets)
        address[] memory sortedPlayers = new address[](allPlayers.length);
        uint256[] memory sortedScores = new uint256[](allPlayers.length);
        
        // Copy data
        for (uint256 i = 0; i < allPlayers.length; i++) {
            sortedPlayers[i] = allPlayers[i];
            sortedScores[i] = players[allPlayers[i]].totalStatusScore;
        }
        
        // Sort (bubble sort)
        for (uint256 i = 0; i < sortedPlayers.length; i++) {
            for (uint256 j = i + 1; j < sortedPlayers.length; j++) {
                if (sortedScores[i] < sortedScores[j]) {
                    // Swap scores
                    uint256 tempScore = sortedScores[i];
                    sortedScores[i] = sortedScores[j];
                    sortedScores[j] = tempScore;
                    
                    // Swap players
                    address tempPlayer = sortedPlayers[i];
                    sortedPlayers[i] = sortedPlayers[j];
                    sortedPlayers[j] = tempPlayer;
                }
            }
        }
        
        // Return top players
        uint256 returnCount = limit > sortedPlayers.length ? sortedPlayers.length : limit;
        for (uint256 i = 0; i < returnCount; i++) {
            topPlayers[i] = sortedPlayers[i];
            topScores[i] = sortedScores[i];
        }
        
        return (topPlayers, topScores);
    }
    
    function getRegionalLeaderboard(string memory region, uint256 limit) external view returns (address[] memory, uint256[] memory) {
        require(limit > 0 && limit <= 100, "Limit must be between 1 and 100");
        
        address[] memory regionPlayers = playersByRegion[region];
        address[] memory topPlayers = new address[](limit);
        uint256[] memory topScores = new uint256[](limit);
        
        if (regionPlayers.length == 0) {
            return (topPlayers, topScores);
        }
        
        // Sort regional players
        address[] memory sortedPlayers = new address[](regionPlayers.length);
        uint256[] memory sortedScores = new uint256[](regionPlayers.length);
        
        // Copy data
        for (uint256 i = 0; i < regionPlayers.length; i++) {
            sortedPlayers[i] = regionPlayers[i];
            sortedScores[i] = players[regionPlayers[i]].totalStatusScore;
        }
        
        // Sort (bubble sort)
        for (uint256 i = 0; i < sortedPlayers.length; i++) {
            for (uint256 j = i + 1; j < sortedPlayers.length; j++) {
                if (sortedScores[i] < sortedScores[j]) {
                    // Swap scores
                    uint256 tempScore = sortedScores[i];
                    sortedScores[i] = sortedScores[j];
                    sortedScores[j] = tempScore;
                    
                    // Swap players
                    address tempPlayer = sortedPlayers[i];
                    sortedPlayers[i] = sortedPlayers[j];
                    sortedPlayers[j] = tempPlayer;
                }
            }
        }
        
        // Return top players
        uint256 returnCount = limit > sortedPlayers.length ? sortedPlayers.length : limit;
        for (uint256 i = 0; i < returnCount; i++) {
            topPlayers[i] = sortedPlayers[i];
            topScores[i] = sortedScores[i];
        }
        
        return (topPlayers, topScores);
    }
    
    function getPlayerData(address player) external view returns (PlayerData memory) {
        require(players[player].isRegistered, "Player not registered");
        return players[player];
    }
    
    function getPlayerRank(address player) external view returns (uint256 globalRank, uint256 regionalRank) {
        require(players[player].isRegistered, "Player not registered");
        
        uint256 playerScore = players[player].totalStatusScore;
        string memory playerRegion = players[player].region;
        
        // Calculate global rank
        globalRank = 1;
        for (uint256 i = 0; i < allPlayers.length; i++) {
            if (players[allPlayers[i]].totalStatusScore > playerScore) {
                globalRank++;
            }
        }
        
        // Calculate regional rank
        regionalRank = 1;
        address[] memory regionPlayers = playersByRegion[playerRegion];
        for (uint256 i = 0; i < regionPlayers.length; i++) {
            if (players[regionPlayers[i]].totalStatusScore > playerScore) {
                regionalRank++;
            }
        }
    }
    
    function startNewSeason() external onlyOwner {
        currentSeason++;
        emit SeasonStarted(currentSeason);
    }
    
    function updateStatusWeights(
        uint256 _lifeTokenWeight,
        uint256 _propertyWeight,
        uint256 _limitedEditionWeight,
        uint256 _checkInWeight
    ) external onlyOwner {
        require(_lifeTokenWeight + _propertyWeight + _limitedEditionWeight + _checkInWeight == 10000, "Weights must sum to 10000");
        
        lifeTokenWeight = _lifeTokenWeight;
        propertyWeight = _propertyWeight;
        limitedEditionWeight = _limitedEditionWeight;
        checkInWeight = _checkInWeight;
        
        emit WeightsUpdated(_lifeTokenWeight, _propertyWeight, _limitedEditionWeight, _checkInWeight);
    }
    
    function addAuthorizedUpdater(address updater) external onlyOwner {
        authorizedUpdaters[updater] = true;
        emit AuthorizedUpdaterAdded(updater);
    }
    
    function removeAuthorizedUpdater(address updater) external onlyOwner {
        authorizedUpdaters[updater] = false;
        emit AuthorizedUpdaterRemoved(updater);
    }
    
    function getTotalPlayers() external view returns (uint256) {
        return allPlayers.length;
    }
    
    function getRegionalPlayerCount(string memory region) external view returns (uint256) {
        return playersByRegion[region].length;
    }
    
    // Required by UUPSUpgradeable
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}