// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface ILIFE {
    function mint(address to, uint256 amount) external;
    function balanceOf(address account) external view returns (uint256);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function hasReceivedSigningBonus(address user) external view returns (bool);
    function getLifetimeCheckIns(address user) external view returns (uint256);
    function getUserRegion(address user) external view returns (string memory);
}

interface IProperty {
    function mintProperty(
        address to,
        string memory name,
        string memory propertyType,
        string memory location,
        uint256 level,
        uint256 purchasePrice,
        string memory tokenURI
    ) external returns (uint256);
    
    function ownerOf(uint256 tokenId) external view returns (address);
    function transferFrom(address from, address to, uint256 tokenId) external;
    function safeTransferFrom(address from, address to, uint256 tokenId) external;
    function burn(uint256 tokenId) external;
    function setAuthorizedMinter(address minter, bool authorized) external;
    function getProperty(uint256 tokenId) external view returns (
        string memory name,
        string memory propertyType,
        string memory location,
        uint256 level,
        uint256 statusPoints,
        uint256 yieldRate,
        uint256 purchasePrice,
        uint256 createdAt
    );
}

interface ILimitedEdition {
    function mintLimitedEdition(
        address to,
        string memory templateName,
        string memory tokenURI
    ) external returns (uint256);
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
    );
}

interface IPlayerRegistry {
    function registerPlayer(address player) external;
    function updatePlayerData(address player) external;
}

contract Economy is Initializable, UUPSUpgradeable, OwnableUpgradeable, ReentrancyGuardUpgradeable {
    using SafeERC20 for IERC20;
    
    // Contract references
    ILIFE public lifeToken;
    IERC20 public wldToken; // Worldcoin token
    IProperty public propertyContract;
    ILimitedEdition public limitedEditionContract;
    IPlayerRegistry public playerRegistry;
    
    // Treasury addresses
    address public treasury;
    address public devWallet;
    
    // Property pricing
    struct PropertyPrice {
        uint256 lifePrice;
        uint256 wldPrice;
        bool isActive;
    }
    
    mapping(string => PropertyPrice) public propertyPrices; // propertyType => price
    
    // Limited Edition pricing
    mapping(string => PropertyPrice) public limitedEditionPrices; // templateName => price
    
    // Fee structure (in basis points, 10000 = 100%)
    uint256 public treasuryFee; // Fee that goes to treasury
    uint256 public devFee; // Fee that goes to dev wallet
    
    // Exchange rates (WLD to LIFE conversion)
    uint256 public wldToLifeRate; // How many LIFE tokens per 1 WLD (scaled by 1e18)
    
    // Purchase tracking
    mapping(address => uint256) public totalPurchases;
    mapping(address => uint256) public totalSpentLife;
    mapping(address => uint256) public totalSpentWld;
    
    // Simplified features - no discounts
    mapping(string => bool) public worldIDOnlyProperties; // Properties requiring World ID verification (optional)
    
    // Income tracking
    mapping(uint256 => uint256) public lastIncomeClaimTime; // tokenId => timestamp
    mapping(address => uint256) public totalIncomeEarned; // user => total LIFE earned from properties
    
    // Property buyback settings
    uint256 public buybackPercentage; // 75% in basis points (out of 10000)
    
    // Income generation settings
    uint256 public baseIncomeRate; // Base income rate per day (in LIFE tokens per 10000 basis points)
    uint256 public holdingBonusRate; // Additional bonus per day of holding (in basis points)
    uint256 public maxHoldingBonus; // Maximum holding bonus (in basis points)
    
    // Events
    event PropertyPurchased(address indexed buyer, string propertyType, uint256 tokenId, uint256 lifePrice, uint256 wldPrice);
    event LimitedEditionPurchased(address indexed buyer, string templateName, uint256 tokenId, uint256 lifePrice, uint256 wldPrice);
    event PropertySoldToContract(uint256 indexed tokenId, address indexed seller, uint256 buybackPrice);
    event IncomeClaimedFromProperty(address indexed owner, uint256 tokenId, uint256 incomeAmount, uint256 daysSinceLastClaim);
    event IncomeRatesUpdated(uint256 baseIncomeRate, uint256 holdingBonusRate, uint256 maxHoldingBonus);
    event PropertyPriceUpdated(string propertyType, uint256 lifePrice, uint256 wldPrice, bool isActive);
    event LimitedEditionPriceUpdated(string templateName, uint256 lifePrice, uint256 wldPrice, bool isActive);
    event FeesUpdated(uint256 treasuryFee, uint256 devFee);
    event ExchangeRateUpdated(uint256 newRate);
    event TreasuryUpdated(address newTreasury);
    event DevWalletUpdated(address newDevWallet);
    event BuybackPercentageUpdated(uint256 newPercentage);
    event WorldIDOnlyPropertySet(string propertyType, bool isExclusive);
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    function initialize(
        address _owner,
        address _lifeToken,
        address _wldToken,
        address _propertyContract,
        address _limitedEditionContract,
        address _playerRegistry,
        address _treasury,
        address _devWallet
    ) public initializer {
        __UUPSUpgradeable_init();
        __Ownable_init(_owner);
        __ReentrancyGuard_init();
        
        lifeToken = ILIFE(_lifeToken);
        wldToken = IERC20(_wldToken);
        propertyContract = IProperty(_propertyContract);
        limitedEditionContract = ILimitedEdition(_limitedEditionContract);
        playerRegistry = IPlayerRegistry(_playerRegistry);
        treasury = _treasury;
        devWallet = _devWallet;
        
        // Initialize default fees (5% treasury, 2% dev)
        treasuryFee = 500; // 5%
        devFee = 200; // 2%
        
        // Initialize default exchange rate (1 WLD = 100 LIFE)
        wldToLifeRate = 100 * 1e18;
        
        // Initialize income generation settings
        baseIncomeRate = 1 * 1e18; // 1 LIFE token per day base rate
        holdingBonusRate = 10; // 0.1% additional per day of holding
        maxHoldingBonus = 5000; // Maximum 50% bonus
        // Initialize buyback settings
        buybackPercentage = 7500; // 75% in basis points
        
        // Initialize default property prices
        propertyPrices["house"] = PropertyPrice(1000 * 1e18, 10 * 1e18, true); // 1000 LIFE or 10 WLD
        propertyPrices["apartment"] = PropertyPrice(500 * 1e18, 5 * 1e18, true); // 500 LIFE or 5 WLD
        propertyPrices["office"] = PropertyPrice(2000 * 1e18, 20 * 1e18, true); // 2000 LIFE or 20 WLD
        propertyPrices["land"] = PropertyPrice(750 * 1e18, 7.5 * 1e18, true); // 750 LIFE or 7.5 WLD
        propertyPrices["mansion"] = PropertyPrice(5000 * 1e18, 50 * 1e18, true); // 5000 LIFE or 50 WLD
    }
    
    // Optional modifier for World ID verification (for exclusive properties)
    modifier onlyVerifiedWorldIDUser(address user) {
        require(lifeToken.hasReceivedSigningBonus(user), "World ID verification required");
        _;
    }
    
    function purchaseProperty(
        string memory propertyType,
        string memory name,
        string memory location,
        uint256 level,
        bool useWLD,
        string memory tokenURI
    ) external nonReentrant {
        require(propertyPrices[propertyType].isActive, "Property type not available");
        require(level >= 1 && level <= 10, "Invalid level");
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(location).length > 0, "Location cannot be empty");
        
        // Check if property requires World ID verification (optional feature)
        if (worldIDOnlyProperties[propertyType]) {
            require(lifeToken.hasReceivedSigningBonus(msg.sender), "World ID verification required for this property");
        }
        
        PropertyPrice memory price = propertyPrices[propertyType];
        uint256 finalPrice;
        uint256 lifeSpent = 0;
        uint256 wldSpent = 0;
        
        // Calculate level-based price multiplier
        uint256 levelMultiplier = 100 + (level - 1) * 20; // +20% per level above 1
        
        if (useWLD) {
            require(price.wldPrice > 0, "WLD payment not accepted for this property");
            finalPrice = (price.wldPrice * levelMultiplier) / 100;
            wldSpent = finalPrice;
            
            // Transfer WLD from buyer
            wldToken.safeTransferFrom(msg.sender, address(this), finalPrice);
            
            // Distribute fees
            uint256 treasuryAmount = (finalPrice * treasuryFee) / 10000;
            uint256 devAmount = (finalPrice * devFee) / 10000;
            
            if (treasuryAmount > 0) {
                wldToken.safeTransfer(treasury, treasuryAmount);
            }
            if (devAmount > 0) {
                wldToken.safeTransfer(devWallet, devAmount);
            }
        } else {
            require(price.lifePrice > 0, "LIFE payment not accepted for this property");
            finalPrice = (price.lifePrice * levelMultiplier) / 100;
            lifeSpent = finalPrice;
            
            // Transfer LIFE from buyer
            require(lifeToken.transferFrom(msg.sender, address(this), finalPrice), "LIFE transfer failed");
            
            // Distribute fees
            uint256 treasuryAmount = (finalPrice * treasuryFee) / 10000;
            uint256 devAmount = (finalPrice * devFee) / 10000;
            
            if (treasuryAmount > 0) {
                require(IERC20(address(lifeToken)).transfer(treasury, treasuryAmount), "Treasury transfer failed");
            }
            if (devAmount > 0) {
                require(IERC20(address(lifeToken)).transfer(devWallet, devAmount), "Dev transfer failed");
            }
        }
        
        // Mint property NFT
        uint256 tokenId = propertyContract.mintProperty(
            msg.sender,
            name,
            propertyType,
            location,
            level,
            finalPrice,
            tokenURI
        );
        
        // Update purchase tracking
        totalPurchases[msg.sender]++;
        totalSpentLife[msg.sender] += lifeSpent;
        totalSpentWld[msg.sender] += wldSpent;
        
        // Initialize income claim time for this property
        lastIncomeClaimTime[tokenId] = block.timestamp;
        
        // Update player registry
        playerRegistry.updatePlayerData(msg.sender);
        
        emit PropertyPurchased(msg.sender, propertyType, tokenId, lifeSpent, wldSpent);
    }
    
    // New function for direct LIFE token transfers (MiniKit compatible)
    function purchasePropertyWithDirectTransfer(
        string memory propertyType,
        string memory name,
        string memory location,
        uint256 level,
        string memory tokenURI
    ) external nonReentrant {
        require(propertyPrices[propertyType].isActive, "Property type not available");
        require(level >= 1 && level <= 10, "Invalid level");
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(location).length > 0, "Location cannot be empty");
        
        // Check if property requires World ID verification (optional feature)
        if (worldIDOnlyProperties[propertyType]) {
            require(lifeToken.hasReceivedSigningBonus(msg.sender), "World ID verification required for this property");
        }
        
        PropertyPrice memory price = propertyPrices[propertyType];
        require(price.lifePrice > 0, "LIFE payment not accepted for this property");
        
        uint256 finalPrice;
        uint256 lifeSpent = 0;
        
        // Calculate level-based price multiplier
        uint256 levelMultiplier = 100 + (level - 1) * 20; // +20% per level above 1
        finalPrice = (price.lifePrice * levelMultiplier) / 100;
        lifeSpent = finalPrice;
        
        // Check if user has sent enough LIFE tokens directly to this contract
        uint256 contractBalance = lifeToken.balanceOf(address(this));
        require(contractBalance >= finalPrice, "Insufficient LIFE tokens sent to contract");
        
        // Distribute fees
        uint256 treasuryAmount = (finalPrice * treasuryFee) / 10000;
        uint256 devAmount = (finalPrice * devFee) / 10000;
        
        if (treasuryAmount > 0) {
            require(IERC20(address(lifeToken)).transfer(treasury, treasuryAmount), "Treasury transfer failed");
        }
        if (devAmount > 0) {
            require(IERC20(address(lifeToken)).transfer(devWallet, devAmount), "Dev transfer failed");
        }
        
        // Mint property NFT
        uint256 tokenId = propertyContract.mintProperty(
            msg.sender,
            name,
            propertyType,
            location,
            level,
            finalPrice,
            tokenURI
        );
        
        // Update purchase tracking
        totalPurchases[msg.sender]++;
        totalSpentLife[msg.sender] += lifeSpent;
        
        // Initialize income claim time for this property
        lastIncomeClaimTime[tokenId] = block.timestamp;
        
        // Update player registry
        playerRegistry.updatePlayerData(msg.sender);
        
        emit PropertyPurchased(msg.sender, propertyType, tokenId, lifeSpent, 0);
    }
    
    // New function for direct WLD token transfers (MiniKit compatible)
    function purchasePropertyWithDirectWLDTransfer(
        string memory propertyType,
        string memory name,
        string memory location,
        uint256 level,
        string memory tokenURI
    ) external nonReentrant {
        require(propertyPrices[propertyType].isActive, "Property type not available");
        require(level >= 1 && level <= 10, "Invalid level");
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(location).length > 0, "Location cannot be empty");
        
        // Check if property requires World ID verification (optional feature)
        if (worldIDOnlyProperties[propertyType]) {
            require(lifeToken.hasReceivedSigningBonus(msg.sender), "World ID verification required for this property");
        }
        
        PropertyPrice memory price = propertyPrices[propertyType];
        require(price.wldPrice > 0, "WLD payment not accepted for this property");
        
        uint256 finalPrice;
        uint256 wldSpent = 0;
        
        // Calculate level-based price multiplier
        uint256 levelMultiplier = 100 + (level - 1) * 20; // +20% per level above 1
        finalPrice = (price.wldPrice * levelMultiplier) / 100;
        wldSpent = finalPrice;
        
        // Check if user has sent enough WLD tokens directly to this contract
        uint256 contractBalance = wldToken.balanceOf(address(this));
        require(contractBalance >= finalPrice, "Insufficient WLD tokens sent to contract");
        
        // Distribute fees
        uint256 treasuryAmount = (finalPrice * treasuryFee) / 10000;
        uint256 devAmount = (finalPrice * devFee) / 10000;
        
        if (treasuryAmount > 0) {
            wldToken.safeTransfer(treasury, treasuryAmount);
        }
        if (devAmount > 0) {
            wldToken.safeTransfer(devWallet, devAmount);
        }
        
        // Mint property NFT
        uint256 tokenId = propertyContract.mintProperty(
            msg.sender,
            name,
            propertyType,
            location,
            level,
            finalPrice,
            tokenURI
        );
        
        // Update purchase tracking
        totalPurchases[msg.sender]++;
        totalSpentWld[msg.sender] += wldSpent;
        
        // Initialize income claim time for this property
        lastIncomeClaimTime[tokenId] = block.timestamp;
        
        // Update player registry
        playerRegistry.updatePlayerData(msg.sender);
        
        emit PropertyPurchased(msg.sender, propertyType, tokenId, 0, wldSpent);
    }
    
    function purchaseLimitedEdition(
        string memory templateName,
        bool useWLD,
        string memory tokenURI
    ) external nonReentrant {
        require(limitedEditionPrices[templateName].isActive, "Limited edition not available");
        
        PropertyPrice memory price = limitedEditionPrices[templateName];
        uint256 finalPrice;
        uint256 lifeSpent = 0;
        uint256 wldSpent = 0;
        
        if (useWLD) {
            require(price.wldPrice > 0, "WLD payment not accepted for this item");
            finalPrice = price.wldPrice;
            wldSpent = finalPrice;
            
            // Transfer WLD from buyer
            wldToken.safeTransferFrom(msg.sender, address(this), finalPrice);
            
            // Distribute fees
            uint256 treasuryAmount = (finalPrice * treasuryFee) / 10000;
            uint256 devAmount = (finalPrice * devFee) / 10000;
            
            if (treasuryAmount > 0) {
                wldToken.safeTransfer(treasury, treasuryAmount);
            }
            if (devAmount > 0) {
                wldToken.safeTransfer(devWallet, devAmount);
            }
        } else {
            require(price.lifePrice > 0, "LIFE payment not accepted for this item");
            finalPrice = price.lifePrice;
            lifeSpent = finalPrice;
            
            // Transfer LIFE from buyer
            require(lifeToken.transferFrom(msg.sender, address(this), finalPrice), "LIFE transfer failed");
            
            // Distribute fees
            uint256 treasuryAmount = (finalPrice * treasuryFee) / 10000;
            uint256 devAmount = (finalPrice * devFee) / 10000;
            
            if (treasuryAmount > 0) {
                require(lifeToken.transferFrom(address(this), treasury, treasuryAmount), "Treasury transfer failed");
            }
            if (devAmount > 0) {
                require(lifeToken.transferFrom(address(this), devWallet, devAmount), "Dev transfer failed");
            }
        }
        
        // Mint limited edition NFT
        uint256 tokenId = limitedEditionContract.mintLimitedEdition(
            msg.sender,
            templateName,
            tokenURI
        );
        
        // Update purchase tracking
        totalPurchases[msg.sender]++;
        totalSpentLife[msg.sender] += lifeSpent;
        totalSpentWld[msg.sender] += wldSpent;
        
        // Update player registry
        playerRegistry.updatePlayerData(msg.sender);
        
        emit LimitedEditionPurchased(msg.sender, templateName, tokenId, lifeSpent, wldSpent);
    }
    
    // Property buyback function - sell back to contract at 75% value
    function sellPropertyToContract(uint256 tokenId) external {
        require(propertyContract.ownerOf(tokenId) == msg.sender, "Not property owner");
        
        // Get property details to calculate buyback price
        (, , , , , , uint256 purchasePrice, ) = propertyContract.getProperty(tokenId);
        
        // Calculate 75% buyback price in LIFE tokens
        uint256 buybackPrice = (purchasePrice * buybackPercentage) / 10000;
        
        // Ensure contract has enough LIFE tokens for buyback
        require(lifeToken.balanceOf(address(this)) >= buybackPrice, "Insufficient contract LIFE balance");
        
        // Burn the NFT
        propertyContract.burn(tokenId);
        
        // Transfer LIFE tokens to seller
        require(IERC20(address(lifeToken)).transfer(msg.sender, buybackPrice), "LIFE transfer failed");
        
        // Clear income tracking for this property
        lastIncomeClaimTime[tokenId] = 0;
        
        emit PropertySoldToContract(tokenId, msg.sender, buybackPrice);
    }
    
    // Income generation functions
    function claimPropertyIncome(uint256 tokenId) external nonReentrant {
        require(propertyContract.ownerOf(tokenId) == msg.sender, "Not the owner of this property");
        
        uint256 lastClaim = lastIncomeClaimTime[tokenId];
        require(lastClaim > 0, "Property not eligible for income");
        require(block.timestamp > lastClaim, "No income to claim yet");
        
        // Get property details
        (, , , uint256 level, , uint256 yieldRate, , uint256 createdAt) = propertyContract.getProperty(tokenId);
        
        // Calculate days since last claim
        uint256 daysSinceLastClaim = (block.timestamp - lastClaim) / 86400; // 86400 seconds in a day
        require(daysSinceLastClaim > 0, "Must wait at least 1 day between claims");
        
        // Calculate holding bonus based on total ownership duration
        uint256 totalHoldingDays = (block.timestamp - createdAt) / 86400;
        uint256 holdingBonus = totalHoldingDays * holdingBonusRate;
        if (holdingBonus > maxHoldingBonus) {
            holdingBonus = maxHoldingBonus;
        }
        
        // Calculate income: base rate * level * yield rate * days * (1 + holding bonus)
        uint256 baseIncome = (baseIncomeRate * level * yieldRate * daysSinceLastClaim) / 10000;
        uint256 bonusIncome = (baseIncome * holdingBonus) / 10000;
        uint256 totalIncome = baseIncome + bonusIncome;
        
        // Update last claim time
        lastIncomeClaimTime[tokenId] = block.timestamp;
        
        // Update total income earned
        totalIncomeEarned[msg.sender] += totalIncome;
        
        // Mint LIFE tokens to the owner
        lifeToken.mint(msg.sender, totalIncome);
        
        emit IncomeClaimedFromProperty(msg.sender, tokenId, totalIncome, daysSinceLastClaim);
    }
    
    function claimAllPropertyIncome(uint256[] calldata tokenIds) external nonReentrant {
        uint256 totalIncome = 0;
        
        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            require(propertyContract.ownerOf(tokenId) == msg.sender, "Not the owner of this property");
            
            uint256 lastClaim = lastIncomeClaimTime[tokenId];
            if (lastClaim == 0 || block.timestamp <= lastClaim) {
                continue; // Skip if not eligible or no time passed
            }
            
            // Calculate days since last claim
            uint256 daysSinceLastClaim = (block.timestamp - lastClaim) / 86400;
            if (daysSinceLastClaim == 0) {
                continue; // Skip if less than 1 day
            }
            
            // Get property details
            (, , , uint256 level, , uint256 yieldRate, , uint256 createdAt) = propertyContract.getProperty(tokenId);
            
            // Calculate holding bonus
            uint256 totalHoldingDays = (block.timestamp - createdAt) / 86400;
            uint256 holdingBonus = totalHoldingDays * holdingBonusRate;
            if (holdingBonus > maxHoldingBonus) {
                holdingBonus = maxHoldingBonus;
            }
            
            // Calculate income
            uint256 baseIncome = (baseIncomeRate * level * yieldRate * daysSinceLastClaim) / 10000;
            uint256 bonusIncome = (baseIncome * holdingBonus) / 10000;
            uint256 propertyIncome = baseIncome + bonusIncome;
            
            totalIncome += propertyIncome;
            
            // Update last claim time
            lastIncomeClaimTime[tokenId] = block.timestamp;
            
            emit IncomeClaimedFromProperty(msg.sender, tokenId, propertyIncome, daysSinceLastClaim);
        }
        
        require(totalIncome > 0, "No income to claim");
        
        // Update total income earned
        totalIncomeEarned[msg.sender] += totalIncome;
        
        // Mint LIFE tokens to the owner
        lifeToken.mint(msg.sender, totalIncome);
    }
    
    function setPropertyPrice(
        string memory propertyType,
        uint256 lifePrice,
        uint256 wldPrice,
        bool isActive
    ) external onlyOwner {
        propertyPrices[propertyType] = PropertyPrice(lifePrice, wldPrice, isActive);
        emit PropertyPriceUpdated(propertyType, lifePrice, wldPrice, isActive);
    }
    
    function setLimitedEditionPrice(
        string memory templateName,
        uint256 lifePrice,
        uint256 wldPrice,
        bool isActive
    ) external onlyOwner {
        limitedEditionPrices[templateName] = PropertyPrice(lifePrice, wldPrice, isActive);
        emit LimitedEditionPriceUpdated(templateName, lifePrice, wldPrice, isActive);
    }
    
    function updateFees(uint256 _treasuryFee, uint256 _devFee) external onlyOwner {
        require(_treasuryFee + _devFee <= 2000, "Total fees cannot exceed 20%");
        treasuryFee = _treasuryFee;
        devFee = _devFee;
        emit FeesUpdated(_treasuryFee, _devFee);
    }
    
    function updateExchangeRate(uint256 _wldToLifeRate) external onlyOwner {
        require(_wldToLifeRate > 0, "Exchange rate must be greater than 0");
        wldToLifeRate = _wldToLifeRate;
        emit ExchangeRateUpdated(_wldToLifeRate);
    }
    
    function updateTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Treasury cannot be zero address");
        treasury = _treasury;
        emit TreasuryUpdated(_treasury);
    }
    
    function updateDevWallet(address _devWallet) external onlyOwner {
        require(_devWallet != address(0), "Dev wallet cannot be zero address");
        devWallet = _devWallet;
        emit DevWalletUpdated(_devWallet);
    }
    
    function getPropertyPrice(string memory propertyType) external view returns (PropertyPrice memory) {
        return propertyPrices[propertyType];
    }
    
    function getLimitedEditionPrice(string memory templateName) external view returns (PropertyPrice memory) {
        return limitedEditionPrices[templateName];
    }
    
    function getPurchaseStats(address user) external view returns (
        uint256 purchases,
        uint256 lifeSpent,
        uint256 wldSpent
    ) {
        return (totalPurchases[user], totalSpentLife[user], totalSpentWld[user]);
    }
    
    function convertWldToLife(uint256 wldAmount) external view returns (uint256) {
        return (wldAmount * wldToLifeRate) / 1e18;
    }
    
    function convertLifeToWld(uint256 lifeAmount) external view returns (uint256) {
        return (lifeAmount * 1e18) / wldToLifeRate;
    }
    
    // View functions for buyback and income
    function calculateBuybackPrice(uint256 tokenId) external view returns (uint256) {
        (, , , , , , uint256 purchasePrice, ) = propertyContract.getProperty(tokenId);
        return (purchasePrice * buybackPercentage) / 10000;
    }
    
    function calculatePropertyIncome(uint256 tokenId) external view returns (uint256, uint256) {
        uint256 lastClaim = lastIncomeClaimTime[tokenId];
        if (lastClaim == 0 || block.timestamp <= lastClaim) {
            return (0, 0);
        }
        
        // Get property details
        (, , , uint256 level, , uint256 yieldRate, , uint256 createdAt) = propertyContract.getProperty(tokenId);
        
        // Calculate days since last claim
        uint256 daysSinceLastClaim = (block.timestamp - lastClaim) / 86400;
        if (daysSinceLastClaim == 0) {
            return (0, 0);
        }
        
        // Calculate holding bonus
        uint256 totalHoldingDays = (block.timestamp - createdAt) / 86400;
        uint256 holdingBonus = totalHoldingDays * holdingBonusRate;
        if (holdingBonus > maxHoldingBonus) {
            holdingBonus = maxHoldingBonus;
        }
        
        // Calculate income
        uint256 baseIncome = (baseIncomeRate * level * yieldRate * daysSinceLastClaim) / 10000;
        uint256 bonusIncome = (baseIncome * holdingBonus) / 10000;
        uint256 totalIncome = baseIncome + bonusIncome;
        
        return (totalIncome, daysSinceLastClaim);
    }
    
    function getPropertyIncomeStats(address user) external view returns (
        uint256 totalEarned,
        uint256 pendingIncome,
        uint256 propertiesCount
    ) {
        // This would require getting user's properties from Property contract
        // For now, return basic stats
        return (totalIncomeEarned[user], 0, 0);
    }
    
    // Admin functions for income settings
    function updateIncomeRates(
        uint256 _baseIncomeRate,
        uint256 _holdingBonusRate,
        uint256 _maxHoldingBonus
    ) external onlyOwner {
        require(_baseIncomeRate > 0, "Base income rate must be greater than 0");
        require(_holdingBonusRate <= 1000, "Holding bonus rate cannot exceed 10%");
        require(_maxHoldingBonus <= 10000, "Max holding bonus cannot exceed 100%");
        
        baseIncomeRate = _baseIncomeRate;
        holdingBonusRate = _holdingBonusRate;
        maxHoldingBonus = _maxHoldingBonus;
        
        emit IncomeRatesUpdated(_baseIncomeRate, _holdingBonusRate, _maxHoldingBonus);
    }
    
    // Admin function to update buyback percentage
    function updateBuybackPercentage(uint256 _buybackPercentage) external onlyOwner {
        require(_buybackPercentage <= 10000, "Buyback percentage cannot exceed 100%");
        require(_buybackPercentage > 0, "Buyback percentage must be greater than 0");
        
        buybackPercentage = _buybackPercentage;
        
        emit BuybackPercentageUpdated(_buybackPercentage);
    }
    
    // Admin function to update WLD token address
    function updateWldToken(address _wldToken) external onlyOwner {
        require(_wldToken != address(0), "WLD token address cannot be zero");
        wldToken = IERC20(_wldToken);
    }

    // Emergency functions
    function emergencyWithdrawLife(uint256 amount) external onlyOwner {
        require(lifeToken.transferFrom(address(this), owner(), amount), "Emergency withdrawal failed");
    }

    function emergencyWithdrawWld(uint256 amount) external onlyOwner {
        wldToken.safeTransfer(owner(), amount);
    }

    // Simple World ID features management
    function setWorldIDOnlyProperty(string memory propertyType, bool isExclusive) external onlyOwner {
        worldIDOnlyProperties[propertyType] = isExclusive;
        emit WorldIDOnlyPropertySet(propertyType, isExclusive);
    }
    
    function isWorldIDOnlyProperty(string memory propertyType) external view returns (bool) {
        return worldIDOnlyProperties[propertyType];
    }
    
    // Required by UUPSUpgradeable
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}