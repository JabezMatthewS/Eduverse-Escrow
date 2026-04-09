const hre = require("hardhat");

async function main() {
  const Escrow = await hre.ethers.getContractFactory("Escrow");
  console.log("Deploying Escrow contract...");
  const escrow = await Escrow.deploy();

  await escrow.waitForDeployment();

  console.log(`Escrow deployed to: ${await escrow.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
