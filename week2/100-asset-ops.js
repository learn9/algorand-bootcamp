// algorand standard asset (asa) operations
// 
// code example modified from: https://developer.algorand.org/docs/get-details/asa/?from_query=Asset%20Crea#creating-an-asset


const algosdk = require('algosdk');

const mnemonic1 = "venture below bean allow goat alert file evil key syrup clinic traffic entire number diet corn month accident marine phrase sample drift hair abstract credit";
const mnemonic2 = "surround agree cancel drama candy alien express figure collect artefact aerobic turkey citizen once dust escape blouse clinic ocean movie correct waste ensure absorb lizard";
const mnemonic3 = "method sign hockey enough since engine ostrich liberty work hood very grace chronic when next bless crater turkey need fluid puzzle creek dose abandon put";

//let myAccount = createAccount();
let recoveredAccount1 = algosdk.mnemonicToSecretKey(mnemonic1);
// assuming the account is funded already
//console.log("Press any key when the account is funded");
//await keypress();
let recoveredAccount2 = algosdk.mnemonicToSecretKey(mnemonic2);
let recoveredAccount3 = algosdk.mnemonicToSecretKey(mnemonic3);

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

let params = null;
// set by createAsset() when asset is created;
let assetID = null;

// create asset
// example from: https://developer.algorand.org/docs/get-details/asa/?from_query=Asset%20Crea#creating-an-asset
async function createAsset() {

    params = await algodclient.getTransactionParams().do();
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

    
    // wait for transaction to be confirmed
    const ptx = await algosdk.waitForConfirmation(algodclient, tx.txId, 4);
    // Get the new asset's information from the creator account
    assetID = ptx["asset-index"];
    //Get the completed Transaction
    console.log("Transaction " + tx.txId + " confirmed in round " + ptx["confirmed-round"]);

}

// modify asset
// https://developer.algorand.org/docs/get-details/asa/?from_query=Asset%20Crea#modifying-an-asset
async function modifyAsset() {
    params = await algodclient.getTransactionParams().do();
    // comment out the next two lines to use suggested fee
    // params.fee = 1000;
    // params.flatFee = true;
    // Asset configuration specific parameters
    // all other values are the same so we leave 
    // them set.
    // specified address can change reserve, freeze, clawback, and manager
    manager = recoveredAccount1.addr;

    // Note that the change has to come from the existing manager
    let ctxn = algosdk.makeAssetConfigTxnWithSuggestedParams(
        recoveredAccount2.addr, 
        note, 
        assetID, 
        manager, 
        reserve, 
        freeze, 
        clawback, 
        params);

    // This transaction must be signed by the current manager
    rawSignedTxn = ctxn.signTxn(recoveredAccount2.sk)
    let ctx = (await algodclient.sendRawTransaction(rawSignedTxn).do());
    // Wait for confirmation
    let confirmedTxn = await algosdk.waitForConfirmation(algodclient, ctx.txId, 4);
    //Get the completed Transaction
    console.log("Transaction " + ctx.txId + " confirmed in round " + confirmedTxn["confirmed-round"]);

    // Get the asset information for the newly changed asset
    // use indexer or utiltiy function for Account info
    // The manager should now be the same as the creator
    //await printCreatedAsset(algodclient, recoveredAccount1.addr, assetID);
}

// 
// Before an account can receive a specific asset it must opt-in to receive it. An opt-in transaction places an asset holding of 0 into the account and increases its minimum balance by 100,000 microAlgos. An opt-in transaction is simply an asset transfer with an amount of 0, both to and from the account opting in. The following code illustrates this transaction.
// https://developer.algorand.org/docs/get-details/asa/?from_query=Asset%20Crea#receiving-an-asset
async function optinToAsset() {
    // Opting in to transact with the new asset
    // Allow accounts that want recieve the new asset
    // Have to opt in. To do this they send an asset transfer
    // of the new asset to themseleves 
    // In this example we are setting up the 3rd recovered account to 
    // receive the new asset

    // First update changing transaction parameters
    // We will account for changing transaction parameters
    // before every transaction in this example
    params = await algodclient.getTransactionParams().do();
    //comment out the next two lines to use suggested fee
    // params.fee = 1000;
    // params.flatFee = true;

    let sender = recoveredAccount3.addr;
    let recipient = sender;
    // We set revocationTarget to undefined as 
    // This is not a clawback operation
    let revocationTarget = undefined;
    // CloseReaminerTo is set to undefined as
    // we are not closing out an asset
    let closeRemainderTo = undefined;
    // We are sending 0 assets
    amount = 0;
    // signing and sending "txn" allows sender to begin accepting asset specified by creator and index
    let opttxn = algosdk.makeAssetTransferTxnWithSuggestedParams(
        sender, 
        recipient, 
        closeRemainderTo, 
        revocationTarget,
        amount, 
        note, 
        assetID, 
        params);

    // Must be signed by the account wishing to opt in to the asset    
    rawSignedTxn = opttxn.signTxn(recoveredAccount3.sk);
    let opttx = (await algodclient.sendRawTransaction(rawSignedTxn).do());
    // Wait for confirmation
    confirmedTxn = await algosdk.waitForConfirmation(algodclient, opttx.txId, 4);
    //Get the completed Transaction
    console.log("Transaction " + opttx.txId + " confirmed in round " + confirmedTxn["confirmed-round"]);

    //You should now see the new asset listed in the account information
    console.log("Account 3 = " + recoveredAccount3.addr);
    //await printAssetHolding(algodclient, recoveredAccount3.addr, assetID);
}
 
// https://developer.algorand.org/docs/get-details/asa/?from_query=Asset%20Crea#transferring-an-asset
// Assets can be transferred between accounts that have opted-in to receiving the asset. These are analogous to standard payment transactions but for Algorand Standard Assets.
async function transferAsset() {
    // Transfer New Asset:
    // Now that account3 can recieve the new tokens 
    // we can tranfer tokens in from the creator
    // to account3
    // First update changing transaction parameters
    // We will account for changing transaction parameters
    // before every transaction in this example

    params = await algodclient.getTransactionParams().do();
    //comment out the next two lines to use suggested fee
    // params.fee = 1000;
    // params.flatFee = true;

    sender = recoveredAccount1.addr;
    recipient = recoveredAccount3.addr;
    revocationTarget = undefined;
    closeRemainderTo = undefined;
    //Amount of the asset to transfer
    amount = 10;

    // signing and sending "txn" will send "amount" assets from "sender" to "recipient"
    let xtxn = algosdk.makeAssetTransferTxnWithSuggestedParams(
        sender, 
        recipient, 
        closeRemainderTo, 
        revocationTarget,
        amount,  
        note, 
        assetID, 
        params);
    // Must be signed by the account sending the asset  
    rawSignedTxn = xtxn.signTxn(recoveredAccount1.sk)
    let xtx = (await algodclient.sendRawTransaction(rawSignedTxn).do());

    // Wait for confirmation
    confirmedTxn = await algosdk.waitForConfirmation(algodclient, xtx.txId, 4);
    //Get the completed Transaction
    console.log("Transaction " + xtx.txId + " confirmed in round " + confirmedTxn["confirmed-round"]);

    // You should now see the 10 assets listed in the account information
    console.log("Account 3 = " + recoveredAccount3.addr);
    //await printAssetHolding(algodclient, recoveredAccount3.addr, assetID);
}

// Freezing or unfreezing an asset for an account requires a transaction that is signed by the freeze account. The code below illustrates the freeze transaction.
// https://developer.algorand.org/docs/get-details/asa/?from_query=Asset%20Crea#freezing-an-asset
async function freezeAsset() {
    // freeze asset
    // The asset was created and configured to allow freezing an account
    // If the freeze address is set "", it will no longer be possible to do this.
    // In this example we will now freeze account3 from transacting with the 
    // The newly created asset. 
    // The freeze transaction is sent from the freeze acount
    // Which in this example is account2 

    // First update changing transaction parameters
    // We will account for changing transaction parameters
    // before every transaction in this example
    // await getChangingParms(algodclient);
    params = await algodclient.getTransactionParams().do();
    //comment out the next two lines to use suggested fee
    // params.fee = 1000;
    // params.flatFee = true;

    from = recoveredAccount2.addr;
    freezeTarget = recoveredAccount3.addr;
    freezeState = true;

    // The freeze transaction needs to be signed by the freeze account
    let ftxn = algosdk.makeAssetFreezeTxnWithSuggestedParams(
        from, 
        note,
        assetID, 
        freezeTarget, 
        freezeState, 
        params)

    // Must be signed by the freeze account   
    rawSignedTxn = ftxn.signTxn(recoveredAccount2.sk)
    let ftx = (await algodclient.sendRawTransaction(rawSignedTxn).do());

    // Wait for confirmation
    confirmedTxn = await algosdk.waitForConfirmation(algodclient, ftx.txId, 4);
    //Get the completed Transaction
    console.log("Transaction " + ftx.txId + " confirmed in round " + confirmedTxn["confirmed-round"]);

    // You should now see the asset is frozen listed in the account information
    console.log("Account 3 = " + recoveredAccount3.addr);
    //await printAssetHolding(algodclient, recoveredAccount3.addr, assetID);
}

// Revoking an asset for an account removes a specific number of the asset from the revoke target account. Revoking an asset from an account requires specifying an asset sender (the revoke target account) and an asset receiver (the account to transfer the funds back to). The code below illustrates the clawback transaction.
// https://developer.algorand.org/docs/get-details/asa/?from_query=Asset%20Crea#revoking-an-asset
async function revokeAsset() {
    // Revoke an Asset:
    // The asset was also created with the ability for it to be revoked by 
    // the clawbackaddress. If the asset was created or configured by the manager
    // to not allow this by setting the clawbackaddress to "" then this would 
    // not be possible.
    // We will now clawback the 10 assets in account3. account2
    // is the clawbackaccount and must sign the transaction
    // The sender will be be the clawback adress.
    // the recipient will also be be the creator in this case
    // that is account3
    // First update changing transaction parameters
    // We will account for changing transaction parameters
    // before every transaction in this example
    params = await algodclient.getTransactionParams().do();
    //comment out the next two lines to use suggested fee
    // params.fee = 1000;
    // params.flatFee = true;   

    sender = recoveredAccount2.addr;
    recipient = recoveredAccount1.addr;
    revocationTarget = recoveredAccount3.addr;
    closeRemainderTo = undefined;
    amount = 10;
    // signing and sending "txn" will send "amount" assets from "revocationTarget" to "recipient",
    // if and only if sender == clawback manager for this asset

    let rtxn = algosdk.makeAssetTransferTxnWithSuggestedParams(sender, recipient, closeRemainderTo, revocationTarget,
        amount, note, assetID, params);
    // Must be signed by the account that is the clawback address    
    rawSignedTxn = rtxn.signTxn(recoveredAccount2.sk)
    let rtx = (await algodclient.sendRawTransaction(rawSignedTxn).do());
    // Wait for confirmation
    confirmedTxn = await algosdk.waitForConfirmation(algodclient, rtx.txId, 4);
    //Get the completed Transaction
    console.log("Transaction " + rtx.txId + " confirmed in round " + confirmedTxn["confirmed-round"]);

    // You should now see 0 assets listed in the account information
    // for the third account
    console.log("Account 3 = " + recoveredAccount3.addr);
    //await printAssetHolding(algodclient, recoveredAccount3.addr, assetID);
}

// Created assets can be destroyed only by the asset manager account. All of the assets must be owned by the creator of the asset before the asset can be deleted.
// https://developer.algorand.org/docs/get-details/asa/?from_query=Asset%20Crea#destroying-an-asset
async function destroyAsset() {
    // Destroy an Asset:
    // All of the created assets should now be back in the creators
    // Account so we can delete the asset.
    // If this is not the case the asset deletion will fail

    // First update changing transaction parameters
    // We will account for changing transaction parameters
    // before every transaction in this example

    params = await algodclient.getTransactionParams().do();
    //comment out the next two lines to use suggested fee
    // params.fee = 1000;
    // params.flatFee = true;

    // The address for the from field must be the manager account
    // Which is currently the creator addr1
    addr = recoveredAccount1.addr;
    note = undefined;
    // if all assets are held by the asset creator,
    // the asset creator can sign and issue "txn" to remove the asset from the ledger. 
    let dtxn = algosdk.makeAssetDestroyTxnWithSuggestedParams(
        addr, 
        note, 
        assetID, 
        params);
    // The transaction must be signed by the manager which 
    // is currently set to account1
    rawSignedTxn = dtxn.signTxn(recoveredAccount1.sk)
    let dtx = (await algodclient.sendRawTransaction(rawSignedTxn).do());

    // Wait for confirmation
    confirmedTxn = await algosdk.waitForConfirmation(algodclient, dtx.txId, 4);
    //Get the completed Transaction
    console.log("Transaction " + dtx.txId + " confirmed in round " + confirmedTxn["confirmed-round"]);

    // The account3 and account1 should no longer contain the asset as it has been destroyed
    console.log("Asset ID: " + assetID);
    console.log("Account 1 = " + recoveredAccount1.addr);
    await printCreatedAsset(algodclient, recoveredAccount1.addr, assetID);
    await printAssetHolding(algodclient, recoveredAccount1.addr, assetID);
    console.log("Account 3 = " + recoveredAccount3.addr);
    await printAssetHolding(algodclient, recoveredAccount3.addr, assetID);  
}

// Function used to print created asset for account and assetid
const printCreatedAsset = async function (algodclient, account, assetid) {
    // note: if you have an indexer instance available it is easier to just search accounts for an asset
    let accountInfo = await algodclient.accountInformation(account).do();
    for (idx = 0; idx < accountInfo['created-assets'].length; idx++) {
        let scrutinizedAsset = accountInfo['created-assets'][idx];
        if (scrutinizedAsset['index'] == assetid) {
            console.log("AssetID = " + scrutinizedAsset['index']);
            let myparms = JSON.stringify(scrutinizedAsset['params'], undefined, 2);
            console.log("parms = " + myparms);
            break;
        }
    }
};
// Function used to print asset holding for account and assetid
const printAssetHolding = async function (algodclient, account, assetid) {
    // note: if you have an indexer instance available it is easier to just search accounts for an asset
    let accountInfo = await algodclient.accountInformation(account).do();
    for (idx = 0; idx < accountInfo['assets'].length; idx++) {
        let scrutinizedAsset = accountInfo['assets'][idx];
        if (scrutinizedAsset['asset-id'] == assetid) {
            let myassetholding = JSON.stringify(scrutinizedAsset, undefined, 2);
            console.log("assetholdinginfo = " + myassetholding);
            break;
        }
    }
};


async function main() {
    console.log("-----create asset-----");
    await createAsset();
    console.log("-----modify asset-----");
    await modifyAsset();
    console.log("-----opt-in to receive the asset on account3-----");
    await optinToAsset();
    console.log("-----transfer asset-----");
    await transferAsset();
    console.log("-----freeze asset-----");
    await freezeAsset();
    console.log("-----revoke asset-----");
    await revokeAsset();
    console.log("-----destroy asset-----");
    await destroyAsset();
}

main();