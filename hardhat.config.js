/** @type import('hardhat/config').HardhatUserConfig */
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-deploy");
require("hardhat-contract-sizer");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("dotenv").config();

PRIVATE_KEY = process.env.PRIVATE_KEY;
SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

module.exports = {
  solidity: "0.8.18",

  etherscan: {
    apiKey: ETHERSCAN_API_KEY
  },

  defaultNetwork: "hardhat",

  networks: {
    hardhat: {},

    // goerli: {
    //   chainId: 5,
    //   accounts: [PRIVATE_KEY],
    //   url: GOERLI_RPC_URL,
    // },
    
    sepolia: {
      chainId: 11155111,
      accounts: [PRIVATE_KEY],
      url: SEPOLIA_RPC_URL,
      blockConfirmations: 3
    }
  },

  namedAccounts: {
    deployer: {
      default: 0,
    },
    player : {
      default: 1
    }
  },

  gasReporter: {
    enabled: false
  },

  mocha: {
    timeout: 300000
  }
};
