const { expect } = require("chai");
const hre = require("hardhat");

describe("Escrow Contract", function () {
  let Escrow, escrow;
  let owner, client, freelancer;
  let projectId = 1;
  let amount;

  beforeEach(async function () {
    [owner, client, freelancer] = await hre.ethers.getSigners();
    amount = hre.ethers.parseEther("1.0");
    Escrow = await hre.ethers.getContractFactory("Escrow");
    escrow = await Escrow.deploy();
    await escrow.waitForDeployment();
  });

  it("Should create a project and deposit funds in one step", async function () {
    await expect(
        escrow.connect(client).createAndDeposit(projectId, freelancer.address, { value: amount })
    ).to.changeEtherBalances([client, escrow], [-amount, amount]);

    const project = await escrow.projects(projectId);
    expect(project.client).to.equal(client.address);
    expect(project.freelancer).to.equal(freelancer.address);
    expect(project.amount).to.equal(amount);
    expect(project.status).to.equal(1n); // 1 = LOCKED
  });

  it("Should allow client to release funds", async function () {
    await escrow.connect(client).createAndDeposit(projectId, freelancer.address, { value: amount });
    
    await expect(
        escrow.connect(client).releaseFunds(projectId)
    ).to.changeEtherBalances([escrow, freelancer], [-amount, amount]);

    const project = await escrow.projects(projectId);
    expect(project.status).to.equal(2n); // 2 = APPROVED
  });

  it("Should NOT allow anyone else to release funds", async function () {
    await escrow.connect(client).createAndDeposit(projectId, freelancer.address, { value: amount });
    
    await expect(
        escrow.connect(freelancer).releaseFunds(projectId)
    ).to.be.revertedWith("Escrow: Only client can perform this action");
  });

  it("Should prevent double withdrawal", async function () {
    await escrow.connect(client).createAndDeposit(projectId, freelancer.address, { value: amount });
    await escrow.connect(client).releaseFunds(projectId);
    
    await expect(
        escrow.connect(client).releaseFunds(projectId)
    ).to.be.revertedWith("Escrow: Funds are not locked");
  });
});
