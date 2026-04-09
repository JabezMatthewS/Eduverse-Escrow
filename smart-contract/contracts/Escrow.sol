// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Escrow {
    enum ProjectStatus { PENDING, LOCKED, APPROVED, DISPUTED }

    struct Project {
        address client;
        address freelancer;
        uint256 amount;
        ProjectStatus status;
    }

    // Mapping from projectId to Project
    mapping(uint256 => Project) public projects;
    
    // Track if a contract is currently executing to prevent reentrancy
    bool private locked;

    // Events
    event ProjectCreated(uint256 indexed projectId, address indexed client, address indexed freelancer, uint256 amount);
    event FundsDeposited(uint256 indexed projectId, uint256 amount);
    event FundsReleased(uint256 indexed projectId, address indexed freelancer, uint256 amount);

    // Modifiers
    modifier nonReentrant() {
        require(!locked, "ReentrancyGuard: reentrant call");
        locked = true;
        _;
        locked = false;
    }

    modifier onlyClient(uint256 _projectId) {
        require(msg.sender == projects[_projectId].client, "Escrow: Only client can perform this action");
        _;
    }

    modifier projectExists(uint256 _projectId) {
        require(projects[_projectId].client != address(0), "Escrow: Project does not exist");
        _;
    }

    // Initialize a new project. Typically called via backend but let's make it a transaction here.
    // However, it's safer to have the client initialize it while depositing, or just initialize first.
    // Let's create `createProject` function.
    function createProject(uint256 _projectId, address _freelancer, uint256 _amount) external {
        require(projects[_projectId].client == address(0), "Escrow: Project ID already taken");
        require(_amount > 0, "Escrow: Amount must be greater than 0");
        require(_freelancer != address(0), "Escrow: Invalid freelancer address");
        require(msg.sender != _freelancer, "Escrow: Client and freelancer cannot be the same");

        projects[_projectId] = Project({
            client: msg.sender,
            freelancer: _freelancer,
            amount: _amount,
            status: ProjectStatus.PENDING
        });

        emit ProjectCreated(_projectId, msg.sender, _freelancer, _amount);
    }

    // Deposit funds for a project
    function deposit(uint256 _projectId) external payable projectExists(_projectId) {
        Project storage project = projects[_projectId];
        require(msg.sender == project.client, "Escrow: Only client can deposit");
        require(project.status == ProjectStatus.PENDING, "Escrow: Project is not in PENDING state");
        require(msg.value == project.amount, "Escrow: Deposit must equal the projected amount");

        project.status = ProjectStatus.LOCKED;

        emit FundsDeposited(_projectId, msg.value);
    }

    // Alternatively, combine Create and Deposit into one function
    function createAndDeposit(uint256 _projectId, address _freelancer) external payable {
        require(projects[_projectId].client == address(0), "Escrow: Project ID already taken");
        require(msg.value > 0, "Escrow: Amount must be greater than 0");
        require(_freelancer != address(0), "Escrow: Invalid freelancer address");
        require(msg.sender != _freelancer, "Escrow: Client and freelancer cannot be the same");

        projects[_projectId] = Project({
            client: msg.sender,
            freelancer: _freelancer,
            amount: msg.value,
            status: ProjectStatus.LOCKED
        });

        emit ProjectCreated(_projectId, msg.sender, _freelancer, msg.value);
        emit FundsDeposited(_projectId, msg.value);
    }

    // Client approves work and releases funds
    function releaseFunds(uint256 _projectId) external projectExists(_projectId) onlyClient(_projectId) nonReentrant {
        Project storage project = projects[_projectId];
        require(project.status == ProjectStatus.LOCKED, "Escrow: Funds are not locked");

        project.status = ProjectStatus.APPROVED;

        uint256 payment = project.amount;
        
        // Use call to prevent gas limit issues in transfer
        (bool success, ) = payable(project.freelancer).call{value: payment}("");
        require(success, "Escrow: Transfer failed");

        emit FundsReleased(_projectId, project.freelancer, payment);
    }

    // Helper function to get project status
    function getProjectStatus(uint256 _projectId) external view returns (ProjectStatus) {
        require(projects[_projectId].client != address(0), "Escrow: Project does not exist");
        return projects[_projectId].status;
    }
}
