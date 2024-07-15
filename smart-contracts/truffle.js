module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  contracts_build_directory: '../election-react-app/src/contracts',

  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "5777" // Match any network id
    }
  },

  compilers: {
    solc: {
      version: "0.8.16", // Use a specific version of the Solidity compiler
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        },
        // Enable the experimental ABI encoder
        evmVersion: "istanbul",
        outputSelection: {
          "*": {
            "*": ["abi", "evm.bytecode", "evm.bytecode.sourceMap"]
          }
        }
      }
    }
  }
};
