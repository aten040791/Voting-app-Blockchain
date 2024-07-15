import Web3 from 'web3';
import Election from './contracts/Election.json'

async function getContractInstance () {
    const web3 = new Web3(window.ethereum);

    const networkId = await web3.eth.net.getId();
    const deployedNetwork = Election.networks[networkId];

    const contractInstance = new web3.eth.Contract(Election.abi, deployedNetwork && deployedNetwork.address)
    return contractInstance;
}

async function getAccount() {
    const web3 = new Web3(window.ethereum);
    const accounts = await web3.eth.getAccounts()
    return accounts;
}

export {
    getContractInstance,
    getAccount
}