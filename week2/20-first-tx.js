// create one tx and send it.
// example code from: https://developer.algorand.org/docs/sdks/javascript/#build-first-transaction

const algosdk = require('algosdk');

// test only.  definitely not recommended.
const mnemonic = "venture below bean allow goat alert file evil key syrup clinic traffic entire number diet corn month accident marine phrase sample drift hair abstract credit";

async function firstTransaction() {


    try {
        //let myAccount = createAccount();
        let myAccount = algosdk.mnemonicToSecretKey(mnemonic);
        // assuming the account is funded already
        //console.log("Press any key when the account is funded");
        //await keypress();

        // where to find the url info: https://testnet.algoexplorer.io/api-dev/v2 or https://developer.purestake.io/code-
        // this info are seen here: https://developer.algorand.org/docs/sdks/javascript/#create-an-account-on-algorand 
        // Connect your client
        // const algodToken = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
        // const algodServer = 'http://localhost';
        // const algodPort = 4001;
        const algodToken = '';
        const algodServer = 'https://node.testnet.algoexplorerapi.io/'; // 'https://testnet-algorand.api.purestake.io/ps2';
        const algodPort = '';
        let algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

        //Check your balance
        let accountInfo = await algodClient.accountInformation(myAccount.addr).do();
        console.log("Account balance: %d microAlgos", accountInfo.amount);

        // Construct the transaction
        let params = await algodClient.getTransactionParams().do();
        // comment out the next two lines to use suggested fee
        params.fee = algosdk.ALGORAND_MIN_TX_FEE;
        params.flatFee = true;

        // receiver defined as TestNet faucet address 
        const receiver = "HZ57J3K46JIJXILONBBZOHX6BKPXEM2VVXNRFSUED6DKFD5ZD24PMJ3MVA";
        const enc = new TextEncoder();
        const note = enc.encode("Hello World");
        let amount = 1000; // unit is microAlgos.  so 1000000 microAlgos = 1 algos
        let sender = myAccount.addr;
        let txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
            from: sender, 
            to: receiver, 
            amount: amount, 
            note: note, 
            suggestedParams: params
        });


        // Sign the transaction
        let signedTxn = txn.signTxn(myAccount.sk);
        let txId = txn.txID().toString();
        console.log("Signed transaction with txID: %s", txId);

        // Submit the transaction
        await algodClient.sendRawTransaction(signedTxn).do();

        // Wait for confirmation
        let confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);
        //Get the completed Transaction
        console.log("Transaction " + txId + " confirmed in round " + confirmedTxn["confirmed-round"]);
        let string = new TextDecoder().decode(confirmedTxn.txn.txn.note);
        console.log("Note field: ", string);
        accountInfo = await algodClient.accountInformation(myAccount.addr).do();
        console.log("Transaction Amount: %d microAlgos", confirmedTxn.txn.txn.amt);        
        console.log("Transaction Fee: %d microAlgos", confirmedTxn.txn.txn.fee);

        console.log("Account balance: %d microAlgos", accountInfo.amount);
    }
    catch (err) {
        console.log("err", err);
    }
    process.exit();
};

firstTransaction();