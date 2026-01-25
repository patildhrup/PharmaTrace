const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("PharmaSupplyChainModule", (m) => {
    // Deploy the PharmaSupplyChain contract
    const pharmaSupplyChain = m.contract("PharmaSupplyChain");

    return { pharmaSupplyChain };
});
