// create asset
// example from: https://developer.algorand.org/docs/get-details/asa/?from_query=Asset%20Crea#creating-an-asset

const algosdk = require('algosdk');

const mnemonic1 = "venture below bean allow goat alert file evil key syrup clinic traffic entire number diet corn month accident marine phrase sample drift hair abstract credit";
const mnemonic2 = "surround agree cancel drama candy alien express figure collect artefact aerobic turkey citizen once dust escape blouse clinic ocean movie correct waste ensure absorb lizard";

//let myAccount = createAccount();
let recoveredAccount1 = algosdk.mnemonicToSecretKey(mnemonic1);
// assuming the account is funded already
//console.log("Press any key when the account is funded");
//await keypress();
let recoveredAccount2 = algosdk.mnemonicToSecretKey(mnemonic2);

// where to find the url info: https://testnet.algoexplorer.io/api-dev/v2 or https://developer.purestake.io/code-
// this info are seen here: https://developer.algorand.org/docs/sdks/javascript/#create-an-account-on-algorand 
// Connect your client
// const algodToken = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
// const algodServer = 'http://localhost';
// const algodPort = 4001;
const algodToken = '';
const algodServer = 'https://node.testnet.algoexplorerapi.io/'; // 'https://testnet-algorand.api.purestake.io/ps2';
const algodPort = '';
let algodclient = new algosdk.Algodv2(algodToken, algodServer, algodPort);


// asset related parameters
let note = undefined; // arbitrary data to be stored in the transaction; here, none is stored
// Asset creation specific parameters
// The following parameters are asset specific
// Throughout the example these will be re-used. 
// We will also change the manager later in the example
let addr = recoveredAccount1.addr;
// Whether user accounts will need to be unfrozen before transacting    
let defaultFrozen = false;
// integer number of decimals for asset unit calculation
let decimals = 0;
// total number of this asset available for circulation   
let totalIssuance = 1000;
// Used to display asset units to user    
let unitName = "LATINUM";
// Friendly name of the asset    
let assetName = "latinum";
// Optional string pointing to a URL relating to the asset
let assetURL = "http://someurl";
// Optional hash commitment of some sort relating to the asset. 32 character length.
let assetMetadataHash = "16efaa3924a6fd9d3a4824799a4ac65d";
// The following parameters are the only ones
// that can be changed, and they have to be changed
// by the current manager
// Specified address can change reserve, freeze, clawback, and manager
let manager = recoveredAccount2.addr;
// Specified address is considered the asset reserve
// (it has no special privileges, this is only informational)
let reserve = recoveredAccount2.addr;
// Specified address can freeze or unfreeze user asset holdings 
let freeze = recoveredAccount2.addr;
// Specified address can revoke user asset holdings and send 
// them to other addresses    
let clawback = recoveredAccount2.addr;


async function createAsset() {

    let params = await algodclient.getTransactionParams().do();
    // comment out the next two lines to use suggested fee
    //params.fee = 1000;
    //params.flatFee = true;

    // signing and sending "txn" allows "addr" to create an asset
    let txn = algosdk.makeAssetCreateTxnWithSuggestedParams(
        addr, 
        note,
        totalIssuance, 
        decimals, 
        defaultFrozen, 
        manager, 
        reserve, 
        freeze,
        clawback, 
        unitName, 
        assetName, 
        assetURL, 
        assetMetadataHash, 
        params);

    let rawSignedTxn = txn.signTxn(recoveredAccount1.sk)
    let tx = (await algodclient.sendRawTransaction(rawSignedTxn).do());

    let assetID = null;
    // wait for transaction to be confirmed
    const ptx = await algosdk.waitForConfirmation(algodclient, tx.txId, 4);
    // Get the new asset's information from the creator account
    assetID = ptx["asset-index"];
    //Get the completed Transaction
    console.log("Transaction " + tx.txId + " confirmed in round " + ptx["confirmed-round"]);

}

createAsset();