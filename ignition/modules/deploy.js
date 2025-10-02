
module.exports = async ({ getNamedAccounts, deployments, ethers }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log('Deploying PharmaSupplyChain from', deployer);

  const result = await deploy('PharmaSupplyChain', {
    from: deployer,
    args: [],
    log: true,
  });

  console.log('PharmaSupplyChain deployed to:', result.address);

  // Example: assign roles to sample accounts (only run on local or testnet)
  // NOTE: Remove or protect this in production
  try {
    const chainId = (await ethers.provider.getNetwork()).chainId;
    const contract = await ethers.getContractAt('PharmaSupplyChain', result.address);

    const accounts = await ethers.getSigners();

    // If local network, assign some roles automatically for testing
    if (chainId === 31337 || chainId === 1337) {
      await contract.connect(accounts[0]).assignRole(accounts[0].address, 1); // Supplier
      await contract.connect(accounts[1]).assignRole(accounts[1].address, 2); // Manufacturer
      await contract.connect(accounts[2]).assignRole(accounts[2].address, 3); // Distributor
      await contract.connect(accounts[3]).assignRole(accounts[3].address, 4); // Transporter
      await contract.connect(accounts[4]).assignRole(accounts[4].address, 5); // Wholesaler
      await contract.connect(accounts[5]).assignRole(accounts[5].address, 6); // Retailer
      console.log('Assigned sample roles on local network');
    }
  } catch (e) {
    console.warn('Could not auto-assign sample roles:', e.message);
  }
};

module.exports.tags = ['PharmaSupplyChain'];
