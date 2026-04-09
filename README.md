# 🎓 EDUVERSE | Blockchain Escrow Payment System

[![Solidity](https://img.shields.io/badge/Solidity-%23363636.svg?style=flat-square&logo=solidity&logoColor=white)](https://soliditylang.org/)
[![Ethereum](https://img.shields.io/badge/Ethereum-3C3C3D?style=flat-square&logo=ethereum&logoColor=white)](https://ethereum.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

A secure, trustless escrow payment system designed for the **EDUVERSE** hybrid learning + freelancing platform. This system ensures that freelancers only get paid when the client is satisfied, with all funds safely locked in an Ethereum smart contract.

## 🎯 Key Features

-   **Secure Escrow**: Multi-stage payment lifecycle (Pending -> Locked -> Approved).
-   **Fraud-Proof**: Funds are locked on-chain; only the client can trigger the release.
-   **MetaMask Integration**: Seamless connection for clients and freelancers.
-   **Automated Workflow**: Real-time status updates and automated ETH transfers.
-   **Local Development Suite**: Built-in scripts to manage a full local blockchain environment.

## 🛠️ Technology Stack

-   **Frontend**: HTML5, CSS3 (Modern Glassmorphism), JavaScript (Vanilla).
-   **Smart Contracts**: Solidity ^0.8.28, Hardhat.
-   **Backend**: Node.js, Express.js.
-   **Blockchain Interactivity**: Ethers.js v6.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18.x or higher)
- [MetaMask](https://metamask.io/) browser extension
- [Python 3](https://www.python.org/) (for the lightweight frontend server)

---

## 🚀 Quick Start (Automated)

The quickest way to get everything running on Windows is using the provided PowerShell scripts.

### Step 1: Install Dependencies
Open a terminal and run the installations for both the smart contract and backend environments:
```powershell
# Install smart contract dependencies
cd smart-contract
npm install

# Install backend dependencies
cd ../backend
npm install
cd ..
```

### Step 2: Configure MetaMask
1. Open MetaMask and go to **Settings > Networks > Add Network > Add a network manually**.
2. Enter the following details:
   - **Network Name**: Hardhat Localhost
   - **RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `1337`
   - **Currency**: `ETH`
3. Click **Save** and switch to this network.

### Step 3: Run the Master Script
Run the automated start script from the root project folder:
```powershell
./start.ps1
```
This script will:
- Start the local blockchain node.
- Deploy the Escrow contract.
- Launch the Express backend.
- Start the Frontend web server.
- **Display all necessary addresses and URLs on your screen!**

---

## 🛠️ Manual Usage / Testing Guide

If you want to simulate a real-world transaction, follow these steps:

1. **Import Test Accounts**:
   - Look at the terminal window labeled "Hardhat Node".
   - Copy the **Private Key** of `Account #0` and import it into MetaMask (this is your **Client**).
   - Copy the **Private Key** of `Account #1` and import it into MetaMask (this is your **Freelancer**).

2. **Initiate Escrow**:
   - Go to `http://localhost:8000`.
   - Connect your wallet as the **Client**.
   - Fill in the form: Enter the Freelancer's address (`Account #1`) and an amount (e.g., `0.5 ETH`).
   - Click **Deploy Escrow** and confirm the transaction in MetaMask.

3. **Verify the "Locked" State**:
   - The project will appear in the **In Progress** column.
   - The funds are now securely held by the smart contract.

4. **Approve & Release**:
   - As the **Client**, click the **Approve & Release** button.
   - Once confirmed, the funds will be instantly transferred to the Freelancer's wallet.
   - The project will move to the **Completed** column.

---

## 🛑 Stopping the System

To stop all background processes and clear the ports, run:
```powershell
./stop.ps1
```


## 📁 Project Structure

```text
├── smart-contract/     # Solidity code & Hardhat environment
├── backend/            # Express.js API for project metadata
├── frontend/           # UI code (HTML/CSS/JS)
├── start.ps1           # Master start script
└── stop.ps1           # Master stop script
```

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
