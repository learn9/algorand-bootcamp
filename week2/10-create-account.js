
// learning

console.log("create an account");
// create an account on algorand
// https://developer.algorand.org/docs/sdks/javascript/#create-an-account-on-algorand
const algosdk = require('algosdk');
const createAccount = function() {
    try {  
        const myaccount = algosdk.generateAccount();
        console.log("Account Address = " + myaccount.addr);
        let account_mnemonic = algosdk.secretKeyToMnemonic(myaccount.sk);
        console.log("Account Mnemonic = "+ account_mnemonic);
        console.log("Account created. Save off Mnemonic and address");
        console.log("Add funds to account using the TestNet Dispenser: ");
        console.log("https://dispenser.testnet.aws.algodev.network/ ");
        return myaccount;
    }
    catch (err) {
        console.log("err", err);
    }
};
createAccount();

// example output

// Account Address = BDAIJ734CQOEPOUNXZIFMH27E2GA27HJAI4E7CSQ23EMG76F4MK7XAXB7I
// Account Mnemonic = venture below bean allow goat alert file evil key syrup clinic traffic entire number diet corn month accident marine phrase sample drift hair abstract credit
// Account created. Save off Mnemonic and address
// Add funds to account using the TestNet Dispenser: 
// https://dispenser.testnet.aws.algodev.network/
// not a good idea to record the mnemonic in a file.

// Account Address = RFXUMOESKV6LNK7EC3354A2TFZ4XIITEAOZLONBDYZQJV23NNJQHTHKBS4
// Account Mnemonic = surround agree cancel drama candy alien express figure collect artefact aerobic turkey citizen once dust escape blouse clinic ocean movie correct waste ensure absorb lizard
// Account created. Save off Mnemonic and address
// Add funds to account using the TestNet Dispenser: 
// https://dispenser.testnet.aws.algodev.network/
