const HDWalletProvider = require('@truffle/hdwallet-provider');

require('babel-register')
require('babel-polyfill')
require('dotenv').config()

const privateKeys = process.env.PRIVATE_KEYS.split(',') || ""

module.exports = {
  

  networks: {
    development:{
      host: "127.0.0.1",
      port: 7545,
      network_id: "*"
    },
		goreli:{
			provider: function(){
				return new HDWalletProvider(
					privateKeys,
					`https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`
				)
			},
			gas: 5000000,
			gasPrice: 25000000000,
			network_id: 5
		}
  },

  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis/',

  // Configure your compilers
  compilers: {
    solc: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    },
  },
};
