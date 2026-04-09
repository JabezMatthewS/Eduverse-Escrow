const API_URL = "http://localhost:3000/api/projects";

// Escrow Contract ABI
const ESCROW_ABI = [
  "function createAndDeposit(uint256 _projectId, address _freelancer) payable",
  "function releaseFunds(uint256 _projectId)",
  "function projects(uint256) view returns (address client, address freelancer, uint256 amount, uint8 status)",
  "function getProjectStatus(uint256 _projectId) view returns (uint8)"
];

// Provide contract address manually or from deployed script. 
// Hardhat local node usually deploys sequence to known addresses, but we'll ask user to set this or default.
const CONTRACT_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"; 

let provider;
let signer;
let contract;
let userAddress;

// UI Elements
const connectBtn = document.getElementById("connect-wallet-btn");
const walletStatus = document.getElementById("wallet-status");
const walletAddressSpan = document.getElementById("wallet-address");
const createForm = document.getElementById("create-project-form");
const projectsList = document.getElementById("projects-list");
const loader = document.getElementById("loader-overlay");
const loaderText = document.getElementById("loader-text");
const toast = document.getElementById("toast");
const toastMsg = document.getElementById("toast-msg");

// --- UTILS ---
function showLoader(msg) {
    loaderText.innerText = msg;
    loader.classList.remove("hidden");
}
function hideLoader() { loader.classList.add("hidden"); }

function showToast(msg, isError = false) {
    toastMsg.innerText = msg;
    toast.style.background = isError ? "var(--warning)" : "var(--success)";
    toast.classList.remove("hidden");
    setTimeout(() => toast.classList.add("hidden"), 3000);
}

// --- SETUP ---
async function initEthers() {
    if (window.ethereum) {
        provider = new ethers.BrowserProvider(window.ethereum);
        // Check if already connected
        const accounts = await provider.send("eth_accounts", []);
        if (accounts.length > 0) {
            handleConnect(accounts[0]);
        }
    } else {
        console.warn("MetaMask not found.");
    }
}

async function connectWallet() {
    if (!window.ethereum) return alert("Please install MetaMask.");
    try {
        const accounts = await provider.send("eth_requestAccounts", []);
        handleConnect(accounts[0]);
    } catch(err) {
        console.error("Wallet connection failed:", err);
    }
}

async function handleConnect(address) {
    userAddress = address;
    signer = await provider.getSigner();
    contract = new ethers.Contract(CONTRACT_ADDRESS, ESCROW_ABI, signer);
    
    const formatted = `${address.slice(0,6)}...${address.slice(-4)}`;
    walletAddressSpan.innerText = formatted;
    walletStatus.classList.remove("disconnected");
    walletStatus.classList.add("connected");
    connectBtn.style.display = "none";
    
    // Switch to Localhost Hardhat Network if not on it
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x539' }], // Hex for 1337
        });
    } catch (e) {
        console.log("Could not switch/add network automatically", e);
    }

    loadProjects();
}

// --- APP LOGIC ---

async function createProject(e) {
    e.preventDefault();
    if (!userAddress) return alert("Please connect wallet first.");

    const title = document.getElementById("project-title").value;
    const desc = document.getElementById("project-desc").value;
    const freelancer = document.getElementById("freelancer-address").value;
    const amountEth = document.getElementById("project-amount").value;

    try {
        showLoader("Confirming in Wallet...");

        // 1. Save to Backend First to get Project ID
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title, description: desc, client: userAddress, freelancer, amount: amountEth
            })
        });
        const projectData = await res.json();
        
        // 2. Transact on Blockchain
        showLoader("Deploying Smart Contract...");
        const weiAmount = ethers.parseEther(amountEth);
        const tx = await contract.createAndDeposit(projectData.id, freelancer, { value: weiAmount });
        
        showLoader("Waiting for Block Confirmation...");
        await tx.wait();

        showToast("Escrow Locked Successfully!");
        createForm.reset();
        loadProjects();

    } catch (err) {
        console.error(err);
        showToast("Transaction Failed: " + err.message.slice(0, 50), true);
    } finally {
        hideLoader();
    }
}

async function loadProjects() {
    try {
        const res = await fetch(API_URL);
        const projects = await res.json();
        renderProjects(projects);
    } catch (err) {
        console.error("Failed to load projects", err);
    }
}

async function renderProjects(projects) {
    const listPending = document.getElementById("list-pending");
    const listLocked = document.getElementById("list-locked");
    const listApproved = document.getElementById("list-approved");

    // Clear lists
    listPending.innerHTML = "";
    listLocked.innerHTML = "";
    listApproved.innerHTML = "";
    
    if(!projects || projects.length === 0) return;
    
    for (const p of projects) {
        let status = 0; // PENDING
        if(contract) {
            try {
                status = Number(await contract.getProjectStatus(p.id));
            } catch(e) {}
        }
        
        const statusMap = ["pending", "locked", "approved", "disputed"];
        const statusClass = statusMap[status];

        const isClient = userAddress && (p.client.toLowerCase() === userAddress.toLowerCase());
        const canApprove = isClient && status === 1;

        const card = document.createElement("div");
        card.className = "project-card";
        card.innerHTML = `
            <div class="project-header">
                <h3 class="project-title">${p.title}</h3>
                <div class="project-amount">${p.amount} ETH</div>
            </div>
            <div class="project-info">
                <p>${p.description}</p>
                <p><strong>To:</strong> <span class="mono">${p.freelancer.slice(0,6)}...${p.freelancer.slice(-4)}</span></p>
            </div>
            <div class="project-actions">
                ${canApprove ? `<button class="btn btn-approve" onclick="approveWork(${p.id})">Approve & Release</button>` : ''}
                ${!canApprove && status === 1 ? `<button class="btn btn-disabled" disabled>Locked: Waiting</button>` : ''}
                ${status === 0 ? `<button class="btn btn-disabled" disabled>Waiting for Deposit</button>` : ''}
            </div>
        `;

        if (status === 0) listPending.appendChild(card);
        else if (status === 1) listLocked.appendChild(card);
        else if (status === 2) listApproved.appendChild(card);
    }

    // Restore empty states if lists are empty
    if(listPending.innerHTML === "") listPending.innerHTML = '<div class="empty-state mini">No pending deposits.</div>';
    if(listLocked.innerHTML === "") listLocked.innerHTML = '<div class="empty-state mini">No active projects.</div>';
    if(listApproved.innerHTML === "") listApproved.innerHTML = '<div class="empty-state mini">No history found.</div>';
}

async function approveWork(projectId) {
    try {
        showLoader("Approving in Wallet...");
        const tx = await contract.releaseFunds(projectId);
        
        showLoader("Waiting for Confirmation...");
        await tx.wait();

        showToast("Funds Released to Freelancer!");
        loadProjects();
    } catch(err) {
        console.error(err);
        showToast("Approval Failed", true);
    } finally {
        hideLoader();
    }
}

// Event Listeners
connectBtn.addEventListener("click", connectWallet);
createForm.addEventListener("submit", createProject);

// Tab Switching Logic
function switchTab(tabId) {
    // Hide all tab panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
        pane.classList.add('hidden');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected pane
    const targetPane = document.getElementById('tab-' + tabId);
    targetPane.classList.remove('hidden');
    targetPane.classList.add('active');
    
    // Set active button
    event.currentTarget.classList.add('active');
}

// Init
window.addEventListener("DOMContentLoaded", initEthers);
