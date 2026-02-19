require("@nomicfoundation/hardhat-toolbox");

require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
      timeout: 120000,
      gas: "auto",
      gasPrice: "auto"
    },
    // sepolia: {
    //   url: process.env.SEPOLIA_NETWORK_KEY,
    //   accounts: [process.env.PRIVATE_KEY],
    // },
  },
  // Configure Hardhat node to handle requests better
  defaultNetwork: "localhost",
};


