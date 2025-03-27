require("@nomicfoundation/hardhat-toolbox");

// The next line is part of the sample project, you don't need it in your
// project. It imports a Hardhat task definition, that can be used for
// testing the frontend.
require("./tasks/faucet");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  // solidity: "0.8.17",
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: false,
        // runs: 200
      }
    }
  },
  networks: {
    sepolia: {

    },
    binance: {
      url: 'https://bsc-testnet-rpc.publicnode.com',
    }
  },
  // etherscan: {
  //   apiKey: {
  //     sepolia: 'U76C8IF7UCIP6DGW5NWUC5XD6IYTCQQ2NU'
  //   }
  // }
};
