require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { ethers } = require("ethers");

const app = express();
app.use(cors());
app.use(express.json());

// In-memory array for simplicity (in a real app, use a DB)
const projects = [];
let nextProjectId = 1;

// Define default ABIs (from the Escrow.sol compilation)
// To keep things simple and fully self-contained without needing to read the artifact.
const ESCROW_ABI = [
  "function projects(uint256) view returns (address client, address freelancer, uint256 amount, uint8 status)",
  "function getProjectStatus(uint256 _projectId) view returns (uint8)",
  "event ProjectCreated(uint256 indexed projectId, address indexed client, address indexed freelancer, uint256 amount)",
  "event FundsDeposited(uint256 indexed projectId, uint256 amount)",
  "event FundsReleased(uint256 indexed projectId, address indexed freelancer, uint256 amount)"
];

// Ethers.js setup (connecting to Hardhat local node for reading states)
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || "http://127.0.0.1:8545");
const contractAddress = process.env.CONTRACT_ADDRESS;

app.post("/api/projects", (req, res) => {
    const { title, description, amount, client, freelancer } = req.body;
    
    if(!title || !description || !amount || !client || !freelancer) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const newProject = {
        id: nextProjectId++,
        title,
        description,
        amount,
        client,
        freelancer,
        status: "PENDING" // Kept track locally, but real truth is on chain
    };

    projects.push(newProject);
    res.status(201).json(newProject);
});

app.get("/api/projects", async (req, res) => {
    // In a real app we might sync status from chain before sending
    // For now we just return the local list and let the frontend query the chain when needed
    res.json(projects);
});

app.get("/api/projects/:id", async (req, res) => {
    const projectId = parseInt(req.params.id);
    const project = projects.find(p => p.id === projectId);
    
    if(!project) {
        return res.status(404).json({ error: "Project not found" });
    }

    // Attempt to query on-chain status if contract is deployed
    try {
        if(contractAddress) {
            const contract = new ethers.Contract(contractAddress, ESCROW_ABI, provider);
            const status = await contract.getProjectStatus(projectId);
            
            const statusMap = ["PENDING", "LOCKED", "APPROVED", "DISPUTED"];
            project.onChainStatus = statusMap[status];
        }
    } catch(err) {
        console.error("Error fetching on-chain data:", err.message);
    }
    
    res.json(project);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`EduVerse Backend running on port ${PORT}`);
});
