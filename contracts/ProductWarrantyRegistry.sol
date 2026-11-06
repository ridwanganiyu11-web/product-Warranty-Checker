// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ProductWarrantyRegistry
 * @notice WarrantChain — Register It. Protect It. Verify It.
 * @dev Lightweight smart contract deployed on Botchain Testnet (Chain ID 968)
 *      that allows businesses to register product warranties and customers
 *      to verify warranty status using normalized & hashed serial numbers.
 */
contract ProductWarrantyRegistry {
    struct Business {
        address wallet;
        string name;
        string category;
        string location;
        string website;
        uint256 registeredAt;
        uint256 productCount;
        bool isRegistered;
    }

    struct Warranty {
        bytes32 serialHash;
        string productName;
        string serialNumber;
        string category;
        address businessWallet;
        string businessName;
        uint256 startTimestamp;
        uint256 durationMonths;
        uint256 expiryTimestamp;
        uint256 registeredAt;
        bool isRevoked;
        bool exists;
    }

    // State variables
    mapping(address => Business) private businesses;
    address[] private businessAddresses;

    mapping(bytes32 => Warranty) private warranties;
    bytes32[] private allSerialHashes;
    mapping(address => bytes32[]) private businessSerialHashes;

    // Events
    event BusinessRegistered(
        address indexed wallet,
        string name,
        string category,
        uint256 timestamp
    );

    event BusinessUpdated(
        address indexed wallet,
        string name,
        string category,
        uint256 timestamp
    );

    event WarrantyRegistered(
        bytes32 indexed serialHash,
        address indexed businessWallet,
        string productName,
        string serialNumber,
        uint256 durationMonths,
        uint256 startTimestamp,
        uint256 expiryTimestamp
    );

    event WarrantyRevocationUpdated(
        bytes32 indexed serialHash,
        address indexed businessWallet,
        bool isRevoked,
        uint256 timestamp
    );

    // Custom Errors
    error BusinessNotRegistered();
    error InvalidInput();
    error WarrantyAlreadyRegistered();
    error WarrantyNotFound();
    error UnauthorizedBusiness();

    modifier onlyRegisteredBusiness() {
        if (!businesses[msg.sender].isRegistered) {
            revert BusinessNotRegistered();
        }
        _;
    }

    /**
     * @notice Register or update a business profile on WarrantChain
     * @param name Business display name (e.g., "ABC Electronics")
     * @param category Business industry/category (e.g., "Consumer Electronics")
     * @param location City/Country or store address
     * @param website Official website or contact URL
     */
    function registerBusiness(
        string calldata name,
        string calldata category,
        string calldata location,
        string calldata website
    ) external {
        if (bytes(name).length == 0) {
            revert InvalidInput();
        }

        Business storage biz = businesses[msg.sender];
        bool isNew = !biz.isRegistered;

        biz.wallet = msg.sender;
        biz.name = name;
        biz.category = category;
        biz.location = location;
        biz.website = website;

        if (isNew) {
            biz.registeredAt = block.timestamp;
            biz.isRegistered = true;
            businessAddresses.push(msg.sender);
            emit BusinessRegistered(msg.sender, name, category, block.timestamp);
        } else {
            emit BusinessUpdated(msg.sender, name, category, block.timestamp);
        }
    }

    /**
     * @notice Register a new product warranty on Botchain
     * @param serialHash keccak256 hash of normalized (trimmed, uppercase) serial number
     * @param productName Product model/name (e.g., "HP Laptop")
     * @param serialNumber Display serial number (e.g., "HP-2026-00125")
     * @param category Product category (e.g., "Laptops & Computers")
     * @param durationMonths Warranty duration in months (e.g., 12)
     */
    function registerWarranty(
        bytes32 serialHash,
        string calldata productName,
        string calldata serialNumber,
        string calldata category,
        uint256 durationMonths
    ) external onlyRegisteredBusiness {
        if (
            serialHash == bytes32(0) ||
            bytes(productName).length == 0 ||
            bytes(serialNumber).length == 0 ||
            durationMonths == 0 ||
            durationMonths > 240
        ) {
            revert InvalidInput();
        }

        if (warranties[serialHash].exists) {
            revert WarrantyAlreadyRegistered();
        }

        uint256 startTs = block.timestamp;
        // Approximate 1 month as 30.4375 days (2,629,800 seconds) or 365 days for 12 months
        uint256 durationSeconds = durationMonths == 12
            ? 365 days
            : durationMonths == 24
                ? 730 days
                : durationMonths * 30 days;
        uint256 expiryTs = startTs + durationSeconds;

        Business storage biz = businesses[msg.sender];

        warranties[serialHash] = Warranty({
            serialHash: serialHash,
            productName: productName,
            serialNumber: serialNumber,
            category: category,
            businessWallet: msg.sender,
            businessName: biz.name,
            startTimestamp: startTs,
            durationMonths: durationMonths,
            expiryTimestamp: expiryTs,
            registeredAt: startTs,
            isRevoked: false,
            exists: true
        });

        allSerialHashes.push(serialHash);
        businessSerialHashes[msg.sender].push(serialHash);
        biz.productCount += 1;

        emit WarrantyRegistered(
            serialHash,
            msg.sender,
            productName,
            serialNumber,
            durationMonths,
            startTs,
            expiryTs
        );
    }

    /**
     * @notice Retrieve full warranty information by its normalized serial hash
     * @param serialHash keccak256 hash of the normalized serial number
     */
    function getWarranty(
        bytes32 serialHash
    ) external view returns (Warranty memory) {
        if (!warranties[serialHash].exists) {
            revert WarrantyNotFound();
        }
        return warranties[serialHash];
    }

    /**
     * @notice Check if a warranty exists and is currently valid/active
     * @param serialHash keccak256 hash of the normalized serial number
     */
    function verifyWarranty(
        bytes32 serialHash
    )
        external
        view
        returns (
            bool exists,
            bool isActive,
            string memory productName,
            string memory serialNumber,
            string memory businessName,
            address businessWallet,
            uint256 startTimestamp,
            uint256 expiryTimestamp,
            uint256 durationMonths
        )
    {
        Warranty memory w = warranties[serialHash];
        if (!w.exists) {
            return (false, false, "", "", "", address(0), 0, 0, 0);
        }

        bool active = !w.isRevoked && (block.timestamp <= w.expiryTimestamp);
        return (
            true,
            active,
            w.productName,
            w.serialNumber,
            w.businessName,
            w.businessWallet,
            w.startTimestamp,
            w.expiryTimestamp,
            w.durationMonths
        );
    }

    /**
     * @notice List all product warranties registered by a specific business
     * @param businessWallet Address of the business
     */
    function getBusinessProducts(
        address businessWallet
    ) external view returns (Warranty[] memory) {
        bytes32[] memory hashes = businessSerialHashes[businessWallet];
        Warranty[] memory result = new Warranty[](hashes.length);
        for (uint256 i = 0; i < hashes.length; i++) {
            result[i] = warranties[hashes[i]];
        }
        return result;
    }

    /**
     * @notice Count total registered warranties on WarrantChain
     */
    function getWarrantyCount() external view returns (uint256) {
        return allSerialHashes.length;
    }

    /**
     * @notice Count total registered businesses on WarrantChain
     */
    function getBusinessCount() external view returns (uint256) {
        return businessAddresses.length;
    }

    /**
     * @notice Retrieve business profile details
     */
    function getBusiness(
        address businessWallet
    ) external view returns (Business memory) {
        return businesses[businessWallet];
    }

    /**
     * @notice Allow the registering business to revoke or restore a warranty
     */
    function setWarrantyRevoked(
        bytes32 serialHash,
        bool isRevoked
    ) external onlyRegisteredBusiness {
        Warranty storage w = warranties[serialHash];
        if (!w.exists) {
            revert WarrantyNotFound();
        }
        if (w.businessWallet != msg.sender) {
            revert UnauthorizedBusiness();
        }
        w.isRevoked = isRevoked;
        emit WarrantyRevocationUpdated(
            serialHash,
            msg.sender,
            isRevoked,
            block.timestamp
        );
    }
}

