// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface ILIFE {
    function mint(address to, uint256 amount) external;
    function balanceOf(address account) external view returns (uint256);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function hasReceivedSigningBonus(address user) external view returns (bool);
    function getLifetimeCheckIns(address user) external view returns (uint256);
    function getUserRegion(address user) external view returns (string memory);
}

interface IPropertyV2 {
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
    function burn(uint256 tokenId) external;
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

/**
 * @title EconomyV2
 * @dev Improved economy contract with better World App integration and payment handling
 */
contract EconomyV2 is Initializable, UUPSUpgradeable, OwnableUpgradeable, ReentrancyGuardUpgradeable {
    using SafeERC20 for IERC20;
    
    // Contract references
    ILIFE public lifeToken;
    IERC20 public wldToken;
    IPropertyV2 public propertyContract;
    
    // Treasury and fee management
    address public treasury;
    address public devWallet;
    uint256 public treasuryFee; // Basis points (10000 = 100%)
    uint256 public devFee; // Basis points
    
    // Property pricing structure
    struct PropertyPrice {
        uint256 lifePrice;
        uint256 wldPrice;
        bool isActive;
        bool worldIdRequired; // Requires World ID verification
    }
    
    mapping(string => PropertyPrice) public propertyPrices;
    
    // Payment tracking for World App integration
    struct PendingPayment {
        address buyer;
        string propertyType;
        string name;
        string location;
        uint256 level;
        string tokenURI;
        uint256 amount;
        bool isWLD;
        uint256 timestamp;
        bool completed;
    }
    
    mapping(bytes32 => PendingPayment) public pendingPayments;
    mapping(address => uint256) public userNonce; // For unique payment IDs
    
    // User statistics
    mapping(address => uint256) public totalPurchases;
    mapping(address => uint256) public totalSpentLife;
    mapping(address => uint256) public totalSpentWld;
    
    // Property income system
    mapping(uint256 => uint256) public lastIncomeClaimTime;
    mapping(address => uint256) public totalIncomeEarned;
    uint256 public baseIncomeRate; // LIFE tokens per day
    uint256 public holdingBonusRate; // Bonus per day of holding (basis points)
    uint256 public maxHoldingBonus; // Maximum bonus (basis points)
    
    // Buyback system
    uint256 public buybackPercentage; // Percentage of original price (basis points)
    
    // Events
    event PaymentInitiated(bytes32 indexed paymentId, address indexed buyer, string propertyType, uint256 amount, bool isWLD);
    event PaymentCompleted(bytes32 indexed paymentId, address indexed buyer, uint256 tokenId);
    event PaymentFailed(bytes32 indexed paymentId, string reason);
    event PropertyPurchased(address indexed buyer, string propertyType, uint256 tokenId, uint256 lifePrice, uint256 wldPrice);
    event PropertySoldBack(uint256 indexed tokenId, address indexed seller, uint256 buybackPrice);
    event IncomeClaimedFromProperty(address indexed owner, uint256 tokenId, uint256 incomeAmount, uint256 daysSinceLastClaim);
    event PropertyPriceUpdated(string propertyType, uint256 lifePrice, uint256 wldPrice, bool isActive, bool worldIdRequired);
    event FeesUpdated(uint256 treasuryFee, uint256 devFee);
    event TreasuryUpdated(address newTreasury);
    event DevWalletUpdated(address newDevWallet);
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    function initialize(
        address _owner,
        address _lifeToken,
        address _wldToken,
        address _propertyContract,
        address _treasury,
        address _devWallet
    ) public initializer {
        __UUPSUpgradeable_init();
        __Ownable_init(_owner);
        __ReentrancyGuard_init();
        
        lifeToken = ILIFE(_lifeToken);
        wldToken = IERC20(_wldToken);
        propertyContract = IPropertyV2(_propertyContract);
        treasury = _treasury;
        devWallet = _devWallet;
        
        // Initialize default fees (5% treasury, 2% dev)
        treasuryFee = 500;
        devFee = 200;
        
        // Initialize income generation settings
        baseIncomeRate = 1 * 1e18; // 1 LIFE token per day
        holdingBonusRate = 10; // 0.1% additional per day
        maxHoldingBonus = 5000; // Maximum 50% bonus
        buybackPercentage = 7500; // 75%
        
        // Initialize default property prices
        _setDefaultPropertyPrices();
    }
    
    function _setDefaultPropertyPrices() internal {
        propertyPrices["house"] = PropertyPrice(1000 * 1e18, 10 * 1e18, true, false);
        propertyPrices["apartment"] = PropertyPrice(500 * 1e18, 5 * 1e18, true, false);
        propertyPrices["office"] = PropertyPrice(2000 * 1e18, 20 * 1e18, true, false);
        propertyPrices["land"] = PropertyPrice(750 * 1e18, 7.5 * 1e18, true, false);
        propertyPrices["mansion"] = PropertyPrice(5000 * 1e18, 50 * 1e18, true, true); // Requires World ID
    }
    
    /**
     * @dev Initiate a payment for World App minikit.pay() integration
     * This creates a pending payment that will be completed via callback
     */
    function initiatePayment(
        string memory propertyType,
        string memory name,
        string memory location,
        uint256 level,
        bool useWLD,
        string memory tokenURI
    ) external returns (bytes32 paymentId) {
        require(propertyPrices[propertyType].isActive, "Property type not available");
        require(level >= 1 && level <= 10, "Invalid level");
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(location).length > 0, "Location cannot be empty");
        
        // Check World ID requirement
        if (propertyPrices[propertyType].worldIdRequired) {
            require(lifeToken.hasReceivedSigningBonus(msg.sender), "World ID verification required");
        }
        
        PropertyPrice memory price = propertyPrices[propertyType];
        uint256 finalPrice;
        
        // Calculate level-based price multiplier
        uint256 levelMultiplier = 100 + (level - 1) * 20; // +20% per level above 1
        
        if (useWLD) {
            require(price.wldPrice > 0, "WLD payment not accepted");
            finalPrice = (price.wldPrice * levelMultiplier) / 100;
        } else {
            require(price.lifePrice > 0, "LIFE payment not accepted");
            finalPrice = (price.lifePrice * levelMultiplier) / 100;
        }
        
        // Generate unique payment ID
        paymentId = keccak256(abi.encodePacked(
            msg.sender,
            userNonce[msg.sender],
            block.timestamp,
            propertyType
        ));
        userNonce[msg.sender]++;
        
        // Store pending payment
        pendingPayments[paymentId] = PendingPayment({
            buyer: msg.sender,
            propertyType: propertyType,
            name: name,
            location: location,
            level: level,
            tokenURI: tokenURI,
            amount: finalPrice,
            isWLD: useWLD,
            timestamp: block.timestamp,
            completed: false
        });
        
        emit PaymentInitiated(paymentId, msg.sender, propertyType, finalPrice, useWLD);
        
        return paymentId;
    }
    
    /**
     * @dev Complete a payment after World App confirmation
     * This should be called by a trusted backend or oracle after payment verification
     */
    function completePayment(bytes32 paymentId) external nonReentrant {
        PendingPayment storage payment = pendingPayments[paymentId];
        require(payment.buyer != address(0), "Payment not found");
        require(!payment.completed, "Payment already completed");
        require(block.timestamp <= payment.timestamp + 1 hours, "Payment expired");
        
        // Mark as completed first to prevent reentrancy
        payment.completed = true;
        
        // Mint the property NFT
        uint256 tokenId = propertyContract.mintProperty(
            payment.buyer,
            payment.name,
            payment.propertyType,
            payment.location,
            payment.level,
            payment.amount,
            payment.tokenURI
        );
        
        // Update purchase tracking
        totalPurchases[payment.buyer]++;
        if (payment.isWLD) {
            totalSpentWld[payment.buyer] += payment.amount;
        } else {
            totalSpentLife[payment.buyer] += payment.amount;
        }
        
        // Initialize income claim time
        lastIncomeClaimTime[tokenId] = block.timestamp;
        
        emit PaymentCompleted(paymentId, payment.buyer, tokenId);
        emit PropertyPurchased(
            payment.buyer,
            payment.propertyType,
            tokenId,
            payment.isWLD ? 0 : payment.amount,
            payment.isWLD ? payment.amount : 0
        );
    }
    
    /**
     * @dev Direct LIFE token purchase (traditional ERC-20 transfer)
     */
    function purchasePropertyWithLife(
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
        
        // Check World ID requirement
        if (propertyPrices[propertyType].worldIdRequired) {
            require(lifeToken.hasReceivedSigningBonus(msg.sender), "World ID verification required");
        }
        
        PropertyPrice memory price = propertyPrices[propertyType];
        require(price.lifePrice > 0, "LIFE payment not accepted");
        
        // Calculate final price with level multiplier
        uint256 levelMultiplier = 100 + (level - 1) * 20;
        uint256 finalPrice = (price.lifePrice * levelMultiplier) / 100;
        
        // Transfer LIFE tokens from buyer
        require(lifeToken.transferFrom(msg.sender, address(this), finalPrice), "LIFE transfer failed");
        
        // Distribute fees
        _distributeFees(finalPrice, false);
        
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
        
        // Update tracking
        totalPurchases[msg.sender]++;
        totalSpentLife[msg.sender] += finalPrice;
        lastIncomeClaimTime[tokenId] = block.timestamp;
        
        emit PropertyPurchased(msg.sender, propertyType, tokenId, finalPrice, 0);
    }
    
    /**
     * @dev Claim income from property ownership
     */
    function claimPropertyIncome(uint256 tokenId) external nonReentrant {
        require(propertyContract.ownerOf(tokenId) == msg.sender, "Not property owner");
        
        uint256 lastClaim = lastIncomeClaimTime[tokenId];
        require(lastClaim > 0, "Property not eligible for income");
        require(block.timestamp > lastClaim + 1 days, "Income not available yet");
        
        // Calculate days since last claim
        uint256 daysSinceLastClaim = (block.timestamp - lastClaim) / 1 days;
        
        // Get property details for income calculation
        (, , , uint256 level, , , , uint256 createdAt) = propertyContract.getProperty(tokenId);
        
        // Calculate base income
        uint256 baseIncome = baseIncomeRate * daysSinceLastClaim;
        
        // Calculate holding bonus (based on property age)
        uint256 propertyAge = (block.timestamp - createdAt) / 1 days;
        uint256 holdingBonus = (baseIncome * holdingBonusRate * propertyAge) / 10000;
        
        // Cap the holding bonus
        uint256 maxBonus = (baseIncome * maxHoldingBonus) / 10000;
        if (holdingBonus > maxBonus) {
            holdingBonus = maxBonus;
        }
        
        // Apply level multiplier
        uint256 levelMultiplier = 100 + (level - 1) * 10; // +10% per level above 1
        uint256 totalIncome = ((baseIncome + holdingBonus) * levelMultiplier) / 100;
        
        // Update last claim time
        lastIncomeClaimTime[tokenId] = block.timestamp;
        
        // Mint LIFE tokens as income
        lifeToken.mint(msg.sender, totalIncome);
        totalIncomeEarned[msg.sender] += totalIncome;
        
        emit IncomeClaimedFromProperty(msg.sender, tokenId, totalIncome, daysSinceLastClaim);
    }
    
    /**
     * @dev Sell property back to contract for LIFE tokens
     */
    function sellPropertyToContract(uint256 tokenId) external nonReentrant {
        require(propertyContract.ownerOf(tokenId) == msg.sender, "Not property owner");
        
        // Get property purchase price
        (, , , , , , uint256 purchasePrice, ) = propertyContract.getProperty(tokenId);
        
        // Calculate buyback price (75% of original)
        uint256 buybackPrice = (purchasePrice * buybackPercentage) / 10000;
        
        // Burn the property NFT
        propertyContract.burn(tokenId);
        
        // Transfer LIFE tokens to seller
        lifeToken.mint(msg.sender, buybackPrice);
        
        emit PropertySoldBack(tokenId, msg.sender, buybackPrice);
    }
    
    /**
     * @dev Distribute fees to treasury and dev wallet
     */
    function _distributeFees(uint256 amount, bool isWLD) internal {
        uint256 treasuryAmount = (amount * treasuryFee) / 10000;
        uint256 devAmount = (amount * devFee) / 10000;
        
        if (isWLD) {
            if (treasuryAmount > 0) {
                wldToken.safeTransfer(treasury, treasuryAmount);
            }
            if (devAmount > 0) {
                wldToken.safeTransfer(devWallet, devAmount);
            }
        } else {
            if (treasuryAmount > 0) {
                require(IERC20(address(lifeToken)).transfer(treasury, treasuryAmount), "Treasury transfer failed");
            }
            if (devAmount > 0) {
                require(IERC20(address(lifeToken)).transfer(devWallet, devAmount), "Dev transfer failed");
            }
        }
    }
    
    // Admin functions
    function setPropertyPrice(
        string memory propertyType,
        uint256 lifePrice,
        uint256 wldPrice,
        bool isActive,
        bool worldIdRequired
    ) external onlyOwner {
        propertyPrices[propertyType] = PropertyPrice(lifePrice, wldPrice, isActive, worldIdRequired);
        emit PropertyPriceUpdated(propertyType, lifePrice, wldPrice, isActive, worldIdRequired);
    }
    
    function setFees(uint256 _treasuryFee, uint256 _devFee) external onlyOwner {
        require(_treasuryFee + _devFee <= 1000, "Total fees cannot exceed 10%");
        treasuryFee = _treasuryFee;
        devFee = _devFee;
        emit FeesUpdated(_treasuryFee, _devFee);
    }
    
    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid treasury address");
        treasury = _treasury;
        emit TreasuryUpdated(_treasury);
    }
    
    function setDevWallet(address _devWallet) external onlyOwner {
        require(_devWallet != address(0), "Invalid dev wallet address");
        devWallet = _devWallet;
        emit DevWalletUpdated(_devWallet);
    }
    
    function setBuybackPercentage(uint256 _percentage) external onlyOwner {
        require(_percentage <= 10000, "Percentage cannot exceed 100%");
        buybackPercentage = _percentage;
    }
    
    function setIncomeRates(
        uint256 _baseIncomeRate,
        uint256 _holdingBonusRate,
        uint256 _maxHoldingBonus
    ) external onlyOwner {
        baseIncomeRate = _baseIncomeRate;
        holdingBonusRate = _holdingBonusRate;
        maxHoldingBonus = _maxHoldingBonus;
    }
    
    // View functions
    function getPendingPayment(bytes32 paymentId) external view returns (PendingPayment memory) {
        return pendingPayments[paymentId];
    }
    
    function getPropertyPrice(string memory propertyType) external view returns (PropertyPrice memory) {
        return propertyPrices[propertyType];
    }
    
    function calculatePropertyPrice(string memory propertyType, uint256 level) external view returns (uint256 lifePrice, uint256 wldPrice) {
        PropertyPrice memory price = propertyPrices[propertyType];
        uint256 levelMultiplier = 100 + (level - 1) * 20;
        
        lifePrice = (price.lifePrice * levelMultiplier) / 100;
        wldPrice = (price.wldPrice * levelMultiplier) / 100;
    }
    
    function getIncomeAvailable(uint256 tokenId) external view returns (uint256) {
        uint256 lastClaim = lastIncomeClaimTime[tokenId];
        if (lastClaim == 0 || block.timestamp <= lastClaim + 1 days) {
            return 0;
        }
        
        uint256 daysSinceLastClaim = (block.timestamp - lastClaim) / 1 days;
        (, , , uint256 level, , , , uint256 createdAt) = propertyContract.getProperty(tokenId);
        
        uint256 baseIncome = baseIncomeRate * daysSinceLastClaim;
        uint256 propertyAge = (block.timestamp - createdAt) / 1 days;
        uint256 holdingBonus = (baseIncome * holdingBonusRate * propertyAge) / 10000;
        uint256 maxBonus = (baseIncome * maxHoldingBonus) / 10000;
        
        if (holdingBonus > maxBonus) {
            holdingBonus = maxBonus;
        }
        
        uint256 levelMultiplier = 100 + (level - 1) * 10;
        return ((baseIncome + holdingBonus) * levelMultiplier) / 100;
    }
    
    // Emergency functions
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        if (token == address(0)) {
            payable(owner()).transfer(amount);
        } else {
            IERC20(token).safeTransfer(owner(), amount);
        }
    }
    
    function cancelExpiredPayment(bytes32 paymentId) external {
        PendingPayment storage payment = pendingPayments[paymentId];
        require(payment.buyer != address(0), "Payment not found");
        require(!payment.completed, "Payment already completed");
        require(block.timestamp > payment.timestamp + 1 hours, "Payment not expired");
        
        delete pendingPayments[paymentId];
        emit PaymentFailed(paymentId, "Payment expired");
    }
    
    // Required by UUPSUpgradeable
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}