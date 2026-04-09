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

## 🚀 Quick Start (Automated)

The quickest way to get everything running on Windows is using the provided PowerShell scripts.

### 1. Setup
Clone the repository and install dependencies in both the `smart-contract` and `backend` folders:
```powershell
# Inside smart-contract/
npm install

# Inside backend/
npm install
```

### 2. Run the Stack
Simply run the start script in the root directory:
```powershell
./start.ps1
```
This will automatically:
1.  Launch a local Hardhat blockchain.
2.  Deploy the Escrow contract.
3.  Start the Express API.
4.  Launch the Frontend web server.

### 3. Stop the Stack
To safely shut down all servers and free up the ports:
```powershell
./stop.ps1
```

## 🔐 Manual Configuration (MetaMask)

To interact with the local system, configure a new network in MetaMask:
-   **Network Name**: Hardhat Localhost
-   **RPC URL**: `http://127.0.0.1:8545`
-   **Chain ID**: `1337`
-   **Currency**: `ETH`

*Remember to import at least two accounts from the Hardhat terminal using their Private Keys.*

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
