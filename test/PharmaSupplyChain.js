const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PharmaSupplyChain", function () {
  let contract;
  let accounts;

  beforeEach(async function () {
    accounts = await ethers.getSigners();
    const Pharma = await ethers.getContractFactory("PharmaSupplyChain");
    contract = await Pharma.deploy();
    await contract.deployed();

    // assign roles
    await contract.assignRole(accounts[0].address, 1); // Supplier
    await contract.assignRole(accounts[1].address, 2); // Manufacturer
  });

  it("should let supplier create a product", async function () {
    const productId = ethers.utils.formatBytes32String("drug1");
    await contract.connect(accounts[0]).createProduct(productId, "Paracetamol", "Initial raw material");
    const [name, holder, stage, count] = await contract.getProduct(productId);
    expect(name).to.equal("Paracetamol");
    expect(holder).to.equal(accounts[0].address);
    expect(stage).to.equal(0); // Stage.Created
    expect(count).to.equal(1);
  });

  it("should let manufacturer manufacture the product", async function () {
    const productId = ethers.utils.formatBytes32String("drug1");
    await contract.connect(accounts[0]).createProduct(productId, "Paracetamol", "Raw material");
    await contract.connect(accounts[1]).manufacture(productId, "500mg tablets");
    const [name, holder, stage, count] = await contract.getProduct(productId);
    expect(stage).to.equal(1); // Stage.Manufactured
    expect(holder).to.equal(accounts[1].address);
    expect(count).to.equal(2);
  });
});
