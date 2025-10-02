
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @title PharmaSupplyChain
/// @notice Simple supply-chain tracking for pharmaceutical products. Each actor can register and update product state. History is stored on-chain.
contract PharmaSupplyChain {
    enum Role { None, Supplier, Manufacturer, Distributor, Transporter, Wholesaler, Retailer }
    enum Stage { Created, Manufactured, WithDistributor, InTransport, WithWholesaler, WithRetailer, Sold }

    struct Update {
        address updater;
        Role role;
        uint256 timestamp;
        string note; // free-form details (dates, mg/ml etc.)
    }

    struct Product {
        bytes32 id; // product identifier (could be hash or serial)
        string name;
        address currentHolder;
        Stage stage;
        Update[] history;
        bool exists;
    }

    // role assignment
    mapping(address => Role) public roles;

    // products
    mapping(bytes32 => Product) private products;

    // events
    event RoleAssigned(address indexed who, Role role);
    event ProductCreated(bytes32 indexed id, string name, address indexed supplier);
    event ProductUpdated(bytes32 indexed id, Stage stage, address indexed updater);

    modifier onlyRole(Role r) {
        require(roles[msg.sender] == r, "Unauthorized role");
        _;
    }

    modifier productExists(bytes32 id) {
        require(products[id].exists, "Product not found");
        _;
    }

    constructor() {
        // contract deployer gets no special supply-chain role by default; assign using assignRole
    }

    // ------- Role management -------
    function assignRole(address who, Role role) external {
        // In a production system use access control (Ownable/AccessControl). For simplicity open to any caller here.
        roles[who] = role;
        emit RoleAssigned(who, role);
    }

    function revokeRole(address who) external {
        roles[who] = Role.None;
        emit RoleAssigned(who, Role.None);
    }

    // ------- Product lifecycle -------

    /// @notice Supplier creates a raw-material/product entry
    function createProduct(bytes32 id, string calldata name, string calldata note) external onlyRole(Role.Supplier) {
        require(!products[id].exists, "Product already exists");

        Product storage p = products[id];
        p.id = id;
        p.name = name;
        p.currentHolder = msg.sender;
        p.stage = Stage.Created;
        p.exists = true;

        p.history.push(Update({
            updater: msg.sender,
            role: Role.Supplier,
            timestamp: block.timestamp,
            note: note
        }));

        emit ProductCreated(id, name, msg.sender);
    }

    /// @notice Manufacturer records manufacturing details and advances stage
    function manufacture(bytes32 id, string calldata note) external onlyRole(Role.Manufacturer) productExists(id) {
        Product storage p = products[id];
        p.currentHolder = msg.sender;
        p.stage = Stage.Manufactured;
        p.history.push(Update({updater: msg.sender, role: Role.Manufacturer, timestamp: block.timestamp, note: note }));
        emit ProductUpdated(id, p.stage, msg.sender);
    }

    /// @notice Distributor receives product
    function receiveByDistributor(bytes32 id, string calldata note) external onlyRole(Role.Distributor) productExists(id) {
        Product storage p = products[id];
        p.currentHolder = msg.sender;
        p.stage = Stage.WithDistributor;
        p.history.push(Update({updater: msg.sender, role: Role.Distributor, timestamp: block.timestamp, note: note }));
        emit ProductUpdated(id, p.stage, msg.sender);
    }

    /// @notice Transporter takes product
    function pickupForTransport(bytes32 id, string calldata note) external onlyRole(Role.Transporter) productExists(id) {
        Product storage p = products[id];
        p.currentHolder = msg.sender;
        p.stage = Stage.InTransport;
        p.history.push(Update({updater: msg.sender, role: Role.Transporter, timestamp: block.timestamp, note: note }));
        emit ProductUpdated(id, p.stage, msg.sender);
    }

    /// @notice Wholesaler receives product
    function receiveByWholesaler(bytes32 id, string calldata note) external onlyRole(Role.Wholesaler) productExists(id) {
        Product storage p = products[id];
        p.currentHolder = msg.sender;
        p.stage = Stage.WithWholesaler;
        p.history.push(Update({updater: msg.sender, role: Role.Wholesaler, timestamp: block.timestamp, note: note }));
        emit ProductUpdated(id, p.stage, msg.sender);
    }

    /// @notice Retailer receives product (final before sold)
    function receiveByRetailer(bytes32 id, string calldata note) external onlyRole(Role.Retailer) productExists(id) {
        Product storage p = products[id];
        p.currentHolder = msg.sender;
        p.stage = Stage.WithRetailer;
        p.history.push(Update({updater: msg.sender, role: Role.Retailer, timestamp: block.timestamp, note: note }));
        emit ProductUpdated(id, p.stage, msg.sender);
    }

    /// @notice Mark sold
    function markSold(bytes32 id, string calldata note) external onlyRole(Role.Retailer) productExists(id) {
        Product storage p = products[id];
        p.stage = Stage.Sold;
        p.history.push(Update({updater: msg.sender, role: Role.Retailer, timestamp: block.timestamp, note: note }));
        emit ProductUpdated(id, p.stage, msg.sender);
    }

    // ------- View helpers -------

    /// @notice Get product basic info
    function getProduct(bytes32 id) external view productExists(id) returns (string memory name, address holder, Stage stage, uint256 updatesCount) {
        Product storage p = products[id];
        return (p.name, p.currentHolder, p.stage, p.history.length);
    }

    /// @notice Get a particular update from history by index
    function getUpdate(bytes32 id, uint256 index) external view productExists(id) returns (address updater, Role role, uint256 timestamp, string memory note) {
        Product storage p = products[id];
        require(index < p.history.length, "Index out of bounds");
        Update storage u = p.history[index];
        return (u.updater, u.role, u.timestamp, u.note);
    }

    /// @notice Convenience: get entire history length
    function getHistoryLength(bytes32 id) external view productExists(id) returns (uint256) {
        return products[id].history.length;
    }

    // Optional: helper to encode QR payload off-chain using product id and chain + contract address
}
