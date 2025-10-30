// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/**
 * @title PropertyV2
 * @dev Improved property NFT contract with gas optimization and better integration
 */
contract PropertyV2 is 
    Initializable, 
    ERC721Upgradeable, 
    ERC721URIStorageUpgradeable, 
    UUPSUpgradeable, 
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable 
{
    uint256 private _tokenIdCounter;
    
    // Packed property metadata for gas optimization
    struct PropertyMetadata {
        string name;
        string propertyType; // house, apartment, office, land, mansion
        string location;
        uint256 level; // 1-10
        uint256 statusPoints;
        uint256 yieldRate; // Basis points (e.g., 500 = 5%)
        uint256 purchasePrice; // Original purchase price
        uint256 createdAt;
        uint256 lastTransferTime;
        address originalOwner;
    }
    
    // Property type configurations
    struct PropertyTypeConfig {
        uint256 baseStatusPoints;
        uint256 baseYieldRate;
        bool isActive;
    }
    
    // Storage mappings
    mapping(uint256 => PropertyMetadata) public properties;
    mapping(string => PropertyTypeConfig) public propertyTypeConfigs;
    mapping(address => bool) public authorizedMinters;
    
    // Batch operations for gas efficiency
    mapping(address => uint256[]) private _ownerTokens;
    mapping(uint256 => uint256) private _ownerTokensIndex;
    
    // Events
    event PropertyMinted(
        uint256 indexed tokenId, 
        address indexed owner, 
        string name, 
        string propertyType, 
        string location, 
        uint256 level,
        uint256 purchasePrice
    );
    event PropertyUpgraded(uint256 indexed tokenId, uint256 newLevel, uint256 newStatusPoints, uint256 newYieldRate);
    event PropertyTypeConfigUpdated(string propertyType, uint256 baseStatusPoints, uint256 baseYieldRate, bool isActive);
    event AuthorizedMinterUpdated(address indexed minter, bool authorized);
    event PropertyTransferred(uint256 indexed tokenId, address indexed from, address indexed to, uint256 timestamp);
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    function initialize(address _owner) public initializer {
        __ERC721_init("LIFE Property V2", "LPROPV2");
        __ERC721URIStorage_init();
        __UUPSUpgradeable_init();
        __Ownable_init(_owner);
        __ReentrancyGuard_init();
        
        // Initialize property type configurations
        _initializePropertyTypes();
    }
    
    function _initializePropertyTypes() internal {
        propertyTypeConfigs["house"] = PropertyTypeConfig(100, 300, true); // 100 points, 3% yield
        propertyTypeConfigs["apartment"] = PropertyTypeConfig(50, 200, true); // 50 points, 2% yield
        propertyTypeConfigs["office"] = PropertyTypeConfig(200, 500, true); // 200 points, 5% yield
        propertyTypeConfigs["land"] = PropertyTypeConfig(75, 100, true); // 75 points, 1% yield
        propertyTypeConfigs["mansion"] = PropertyTypeConfig(500, 800, true); // 500 points, 8% yield
    }
    
    /**
     * @dev Mint a new property NFT (only authorized minters)
     */
    function mintProperty(
        address to,
        string memory name,
        string memory propertyType,
        string memory location,
        uint256 level,
        uint256 purchasePrice,
        string memory _tokenURI
    ) public returns (uint256) {
        require(authorizedMinters[msg.sender], "Not authorized to mint");
        require(to != address(0), "Cannot mint to zero address");
        require(level >= 1 && level <= 10, "Level must be between 1 and 10");
        require(bytes(name).length > 0 && bytes(name).length <= 50, "Invalid name length");
        require(bytes(propertyType).length > 0, "Property type cannot be empty");
        require(bytes(location).length > 0 && bytes(location).length <= 50, "Invalid location length");
        require(propertyTypeConfigs[propertyType].isActive, "Invalid or inactive property type");
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        PropertyTypeConfig memory config = propertyTypeConfigs[propertyType];
        
        // Calculate level-based stats
        uint256 statusPoints = config.baseStatusPoints * level;
        uint256 yieldRate = config.baseYieldRate + (level - 1) * 50; // +0.5% per level above 1
        
        // Store property metadata
        properties[tokenId] = PropertyMetadata({
            name: name,
            propertyType: propertyType,
            location: location,
            level: level,
            statusPoints: statusPoints,
            yieldRate: yieldRate,
            purchasePrice: purchasePrice,
            createdAt: block.timestamp,
            lastTransferTime: block.timestamp,
            originalOwner: to
        });
        
        // Mint the NFT
        _mint(to, tokenId);
        _setTokenURI(tokenId, _tokenURI);
        
        // Update owner tokens tracking
        _addTokenToOwnerEnumeration(to, tokenId);
        
        emit PropertyMinted(tokenId, to, name, propertyType, location, level, purchasePrice);
        
        return tokenId;
    }
    
    /**
     * @dev Batch mint multiple properties for gas efficiency
     */
    function batchMintProperties(
        address to,
        string[] memory names,
        string[] memory propertyTypes,
        string[] memory locations,
        uint256[] memory levels,
        uint256[] memory purchasePrices,
        string[] memory tokenURIs
    ) external returns (uint256[] memory tokenIds) {
        require(authorizedMinters[msg.sender], "Not authorized to mint");
        require(to != address(0), "Cannot mint to zero address");
        
        uint256 length = names.length;
        require(
            length == propertyTypes.length &&
            length == locations.length &&
            length == levels.length &&
            length == purchasePrices.length &&
            length == tokenURIs.length,
            "Array length mismatch"
        );
        require(length > 0 && length <= 20, "Invalid batch size"); // Limit batch size for gas
        
        tokenIds = new uint256[](length);
        
        for (uint256 i = 0; i < length; i++) {
            tokenIds[i] = mintProperty(
                to,
                names[i],
                propertyTypes[i],
                locations[i],
                levels[i],
                purchasePrices[i],
                tokenURIs[i]
            );
        }
        
        return tokenIds;
    }
    
    /**
     * @dev Upgrade a property to the next level
     */
    function upgradeProperty(uint256 tokenId) external nonReentrant {
        require(_ownerOf(tokenId) != address(0), "Property does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        
        PropertyMetadata storage property = properties[tokenId];
        require(property.level < 10, "Property already at maximum level");
        
        PropertyTypeConfig memory config = propertyTypeConfigs[property.propertyType];
        
        // Upgrade the property
        property.level++;
        property.statusPoints = config.baseStatusPoints * property.level;
        property.yieldRate = config.baseYieldRate + (property.level - 1) * 50;
        
        emit PropertyUpgraded(tokenId, property.level, property.statusPoints, property.yieldRate);
    }
    
    /**
     * @dev Burn a property NFT (only authorized minters)
     */
    function burn(uint256 tokenId) external {
        require(authorizedMinters[msg.sender], "Not authorized to burn");
        require(_ownerOf(tokenId) != address(0), "Property does not exist");
        
        address owner = ownerOf(tokenId);
        
        // Remove from owner enumeration
        _removeTokenFromOwnerEnumeration(owner, tokenId);
        
        // Clear property metadata
        delete properties[tokenId];
        
        // Burn the NFT
        _burn(tokenId);
    }
    
    /**
     * @dev Get property details
     */
    function getProperty(uint256 tokenId) external view returns (
        string memory name,
        string memory propertyType,
        string memory location,
        uint256 level,
        uint256 statusPoints,
        uint256 yieldRate,
        uint256 purchasePrice,
        uint256 createdAt
    ) {
        require(_ownerOf(tokenId) != address(0), "Property does not exist");
        PropertyMetadata memory prop = properties[tokenId];
        return (
            prop.name,
            prop.propertyType,
            prop.location,
            prop.level,
            prop.statusPoints,
            prop.yieldRate,
            prop.purchasePrice,
            prop.createdAt
        );
    }
    
    /**
     * @dev Get extended property details including ownership info
     */
    function getPropertyExtended(uint256 tokenId) external view returns (
        string memory name,
        string memory propertyType,
        string memory location,
        uint256 level,
        uint256 statusPoints,
        uint256 yieldRate,
        uint256 purchasePrice,
        uint256 createdAt,
        uint256 lastTransferTime,
        address originalOwner,
        uint256 ownershipDuration
    ) {
        require(_ownerOf(tokenId) != address(0), "Property does not exist");
        PropertyMetadata memory prop = properties[tokenId];
        return (
            prop.name,
            prop.propertyType,
            prop.location,
            prop.level,
            prop.statusPoints,
            prop.yieldRate,
            prop.purchasePrice,
            prop.createdAt,
            prop.lastTransferTime,
            prop.originalOwner,
            block.timestamp - prop.lastTransferTime
        );
    }
    
    /**
     * @dev Get all properties owned by an address (gas-optimized)
     */
    function getPropertiesByOwner(address owner) external view returns (uint256[] memory) {
        return _ownerTokens[owner];
    }
    
    /**
     * @dev Get properties by owner with pagination
     */
    function getPropertiesByOwnerPaginated(
        address owner, 
        uint256 offset, 
        uint256 limit
    ) external view returns (uint256[] memory tokenIds, uint256 total) {
        uint256[] memory allTokens = _ownerTokens[owner];
        total = allTokens.length;
        
        if (offset >= total) {
            return (new uint256[](0), total);
        }
        
        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }
        
        tokenIds = new uint256[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            tokenIds[i - offset] = allTokens[i];
        }
        
        return (tokenIds, total);
    }
    
    /**
     * @dev Get total status points for an owner
     */
    function getTotalStatusPoints(address owner) external view returns (uint256) {
        uint256[] memory tokenIds = _ownerTokens[owner];
        uint256 totalPoints = 0;
        
        for (uint256 i = 0; i < tokenIds.length; i++) {
            totalPoints += properties[tokenIds[i]].statusPoints;
        }
        
        return totalPoints;
    }
    
    /**
     * @dev Get properties by type for an owner
     */
    function getPropertiesByTypeForOwner(
        address owner, 
        string memory propertyType
    ) external view returns (uint256[] memory) {
        uint256[] memory allTokens = _ownerTokens[owner];
        uint256 count = 0;
        
        // First pass: count matching properties
        for (uint256 i = 0; i < allTokens.length; i++) {
            if (keccak256(bytes(properties[allTokens[i]].propertyType)) == keccak256(bytes(propertyType))) {
                count++;
            }
        }
        
        // Second pass: collect matching properties
        uint256[] memory result = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < allTokens.length; i++) {
            if (keccak256(bytes(properties[allTokens[i]].propertyType)) == keccak256(bytes(propertyType))) {
                result[index] = allTokens[i];
                index++;
            }
        }
        
        return result;
    }
    
    /**
     * @dev Get property statistics for an owner
     */
    function getOwnerPropertyStats(address owner) external view returns (
        uint256 totalProperties,
        uint256 totalStatusPoints,
        uint256 averageLevel,
        uint256 totalValue
    ) {
        uint256[] memory tokenIds = _ownerTokens[owner];
        totalProperties = tokenIds.length;
        
        if (totalProperties == 0) {
            return (0, 0, 0, 0);
        }
        
        uint256 totalLevels = 0;
        
        for (uint256 i = 0; i < tokenIds.length; i++) {
            PropertyMetadata memory prop = properties[tokenIds[i]];
            totalStatusPoints += prop.statusPoints;
            totalLevels += prop.level;
            totalValue += prop.purchasePrice;
        }
        
        averageLevel = totalLevels / totalProperties;
        
        return (totalProperties, totalStatusPoints, averageLevel, totalValue);
    }
    
    // Admin functions
    function setAuthorizedMinter(address minter, bool authorized) external onlyOwner {
        authorizedMinters[minter] = authorized;
        emit AuthorizedMinterUpdated(minter, authorized);
    }
    
    function setPropertyTypeConfig(
        string memory propertyType,
        uint256 baseStatusPoints,
        uint256 baseYieldRate,
        bool isActive
    ) external onlyOwner {
        propertyTypeConfigs[propertyType] = PropertyTypeConfig(baseStatusPoints, baseYieldRate, isActive);
        emit PropertyTypeConfigUpdated(propertyType, baseStatusPoints, baseYieldRate, isActive);
    }
    
    // Internal functions for owner enumeration
    function _addTokenToOwnerEnumeration(address to, uint256 tokenId) internal {
        _ownerTokensIndex[tokenId] = _ownerTokens[to].length;
        _ownerTokens[to].push(tokenId);
    }
    
    function _removeTokenFromOwnerEnumeration(address from, uint256 tokenId) internal {
        uint256 lastTokenIndex = _ownerTokens[from].length - 1;
        uint256 tokenIndex = _ownerTokensIndex[tokenId];
        
        if (tokenIndex != lastTokenIndex) {
            uint256 lastTokenId = _ownerTokens[from][lastTokenIndex];
            _ownerTokens[from][tokenIndex] = lastTokenId;
            _ownerTokensIndex[lastTokenId] = tokenIndex;
        }
        
        _ownerTokens[from].pop();
        delete _ownerTokensIndex[tokenId];
    }
    
    // Override transfer functions to update ownership tracking
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        address previousOwner = super._update(to, tokenId, auth);
        
        // Update ownership tracking for transfers (not mints/burns)
        if (from != address(0) && to != address(0)) {
            properties[tokenId].lastTransferTime = block.timestamp;
            
            // Update owner enumeration
            _removeTokenFromOwnerEnumeration(from, tokenId);
            _addTokenToOwnerEnumeration(to, tokenId);
            
            emit PropertyTransferred(tokenId, from, to, block.timestamp);
        } else if (from == address(0) && to != address(0)) {
            // Minting - enumeration already handled in mintProperty
        } else if (from != address(0) && to == address(0)) {
            // Burning - enumeration already handled in burn
        }
        
        return previousOwner;
    }
    
    // View functions
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }
    
    function getOwnershipDuration(uint256 tokenId) external view returns (uint256) {
        require(_ownerOf(tokenId) != address(0), "Property does not exist");
        return block.timestamp - properties[tokenId].lastTransferTime;
    }
    
    function getPropertyAge(uint256 tokenId) external view returns (uint256) {
        require(_ownerOf(tokenId) != address(0), "Property does not exist");
        return block.timestamp - properties[tokenId].createdAt;
    }
    
    function getPropertyTypeConfig(string memory propertyType) external view returns (PropertyTypeConfig memory) {
        return propertyTypeConfigs[propertyType];
    }
    
    function isAuthorizedMinter(address minter) external view returns (bool) {
        return authorizedMinters[minter];
    }
    
    // Required overrides
    function tokenURI(uint256 tokenId) 
        public 
        view 
        override(ERC721Upgradeable, ERC721URIStorageUpgradeable) 
        returns (string memory) 
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) 
        public 
        view 
        override(ERC721Upgradeable, ERC721URIStorageUpgradeable) 
        returns (bool) 
    {
        return super.supportsInterface(interfaceId);
    }
    
    // Required by UUPSUpgradeable
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
    
    // Emergency functions
    function emergencyPause() external onlyOwner {
        // Implementation for emergency pause if needed
        // Could pause transfers, minting, etc.
    }
    
    function emergencyUnpause() external onlyOwner {
        // Implementation for emergency unpause
    }
}