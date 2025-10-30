// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {ERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract LimitedEdition is Initializable, ERC721Upgradeable, UUPSUpgradeable, OwnableUpgradeable {
    uint256 private _tokenIdCounter;
    
    // Template data structure for limited editions
    struct TemplateData {
        string name;
        string category;
        string rarity;
        uint256 statusPoints;
        uint256 maxSupply;
        uint256 currentSupply;
        uint256 purchasePrice;
        uint256 createdAt;
        bool isActive;
        string season;
    }
    
    // Simplified metadata structure
    struct NFTMetadata {
        string name;
        string rarity;
        uint256 statusPoints;
        string templateName;
    }
    
    // Mapping from token ID to NFT metadata
    mapping(uint256 => NFTMetadata) public nftMetadata;
    
    // Mapping from template name to template data
    mapping(string => TemplateData) public templates;
    
    // Authorized minters (Economy contract, etc.)
    mapping(address => bool) public authorizedMinters;
    
    // Events
    event LimitedEditionMinted(uint256 indexed tokenId, address indexed owner, string name, string rarity);
    event AuthorizedMinterAdded(address indexed minter);
    event AuthorizedMinterRemoved(address indexed minter);
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    function initialize(address _owner) public initializer {
        __ERC721_init("Limited Edition NFTs", "LIFE-LE");
        __UUPSUpgradeable_init();
        __Ownable_init(_owner);
    }
    
    modifier onlyAuthorizedMinter() {
        require(authorizedMinters[msg.sender] || msg.sender == owner(), "Not authorized to mint");
        _;
    }
    
    function mint(
        address to,
        string memory name,
        string memory rarity,
        uint256 statusPoints
    ) external onlyAuthorizedMinter returns (uint256) {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        _safeMint(to, tokenId);
        
        nftMetadata[tokenId] = NFTMetadata({
            name: name,
            rarity: rarity,
            statusPoints: statusPoints,
            templateName: ""
        });
        
        emit LimitedEditionMinted(tokenId, to, name, rarity);
        return tokenId;
    }
    
    function mintLimitedEdition(
        address to,
        string memory templateName,
        string memory tokenURI
    ) external onlyAuthorizedMinter returns (uint256) {
        require(templates[templateName].isActive, "Template not active");
        require(templates[templateName].currentSupply < templates[templateName].maxSupply, "Max supply reached");
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        _safeMint(to, tokenId);
        
        TemplateData storage template = templates[templateName];
        nftMetadata[tokenId] = NFTMetadata({
            name: template.name,
            rarity: template.rarity,
            statusPoints: template.statusPoints,
            templateName: templateName
        });
        
        template.currentSupply++;
        
        emit LimitedEditionMinted(tokenId, to, template.name, template.rarity);
        return tokenId;
    }
    
    function getLimitedEdition(uint256 templateId) external view returns (
        string memory name,
        string memory category,
        string memory rarity,
        uint256 statusPoints,
        uint256 maxSupply,
        uint256 currentSupply,
        uint256 purchasePrice,
        uint256 createdAt,
        bool isActive,
        string memory season
    ) {
        // Note: This should ideally take templateName as parameter instead of templateId
        // For now, returning empty values as this interface needs clarification
        return ("", "", "", 0, 0, 0, 0, 0, false, "");
    }
    
    function createTemplate(
        string memory templateName,
        string memory category,
        string memory rarity,
        uint256 statusPoints,
        uint256 maxSupply,
        uint256 purchasePrice,
        string memory season
    ) external onlyOwner {
        templates[templateName] = TemplateData({
            name: templateName,
            category: category,
            rarity: rarity,
            statusPoints: statusPoints,
            maxSupply: maxSupply,
            currentSupply: 0,
            purchasePrice: purchasePrice,
            createdAt: block.timestamp,
            isActive: true,
            season: season
        });
    }
    
    function updateTemplateStatus(string memory templateName, bool isActive) external onlyOwner {
        templates[templateName].isActive = isActive;
    }
    
    function getStatusPoints(uint256 tokenId) external view returns (uint256) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return nftMetadata[tokenId].statusPoints;
    }
    
    function getUserStatusPoints(address user) public view returns (uint256) {
        uint256 totalPoints = 0;
        
        for (uint256 i = 0; i < _tokenIdCounter; i++) {
            if (_ownerOf(i) == user) {
                totalPoints += nftMetadata[i].statusPoints;
            }
        }
        
        return totalPoints;
    }
    
    function getTotalStatusPoints(address owner) external view returns (uint256) {
        return getUserStatusPoints(owner);
    }
    
    function addAuthorizedMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = true;
        emit AuthorizedMinterAdded(minter);
    }
    
    function removeAuthorizedMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = false;
        emit AuthorizedMinterRemoved(minter);
    }
    
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }
    
    // Required by UUPSUpgradeable
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}