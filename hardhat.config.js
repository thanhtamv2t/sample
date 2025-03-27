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
      url: "https://sepolia.infura.io/v3/703c33e04a1649088ed0537ef0965779",
      // url: "https://blockchain.googleapis.com/v1/projects/map-blog-2e29d/locations/asia-east1/endpoints/ethereum-sepolia/rpc?key=AIzaSyCWrwgD9Agj-KrOM1tQ6A2hUV8lU4QzuKg",
      accounts: ["046b0f39761b1667b4e29940c00eeb776358042a10354b5fe7a837a38083f2dd","40c30a12dcd4c3922f4817a8b03c431851182a62d1f0ebb48ce2d3768ddbda6f"]
    },
    binance: {
      url: 'https://bsc-testnet-rpc.publicnode.com',
      accounts: ["046b0f39761b1667b4e29940c00eeb776358042a10354b5fe7a837a38083f2dd","40c30a12dcd4c3922f4817a8b03c431851182a62d1f0ebb48ce2d3768ddbda6f"]
    }
  },
  // etherscan: {
  //   apiKey: {
  //     sepolia: 'U76C8IF7UCIP6DGW5NWUC5XD6IYTCQQ2NU'
  //   }
  // }
};
