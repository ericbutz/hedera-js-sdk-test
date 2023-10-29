const {
  Client,
  PrivateKey,
  AccountCreateTransaction,
  AccountBalanceQuery,
  Hbar
} = require("@hashgraph/sdk");

require("dotenv").config({path:'../.env'});

async function createAccount() {
  //Grab your Hedera testnet account ID and private key from your .env file
  const myAccountId = process.env.MY_ACCOUNT_ID;
  const myPrivateKey = process.env.MY_PRIVATE_KEY;

  // If we weren't able to grab it, we should throw a new error
  if (!myAccountId || !myPrivateKey) {
    throw new Error(
      "Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present"
    );
  }
  
  //Create your Hedera Testnet client
  const client = Client.forTestnet();

  //Set your account as the client's operator
  client.setOperator(myAccountId, myPrivateKey);

  //Set the default maximum transaction fee (in Hbar)
  client.setDefaultMaxTransactionFee(new Hbar(100));

  //Set the maximum payment for queries (in Hbar)
  client.setDefaultMaxQueryPayment(new Hbar(50));

  //Create new keys
  const newAccountPrivateKey = PrivateKey.generateECDSA()
  console.log('DER encoded Private Key: ' + newAccountPrivateKey)

  const newAccountPublicKey = newAccountPrivateKey.publicKey;
  console.log('DER Encoded Public Key: ' + newAccountPublicKey)

  //Create a new account with 1,000 tinybar starting balance
  const newAccount = await new AccountCreateTransaction()
  .setKey(newAccountPublicKey)
  .setInitialBalance(Hbar.fromTinybars(1000))
  .execute(client);

  // Get the new account ID
  const getReceipt = await newAccount.getReceipt(client);
  const newAccountId = getReceipt.accountId;

  //Log the account ID
  console.log("The new account ID is: " +newAccountId);

  //Verify the account balance
  const accountBalance = await new AccountBalanceQuery()
  .setAccountId(newAccountId)
  .execute(client);

  console.log("The new account balance is: " + accountBalance.hbars.toTinybars() +" tinybar.");

  client.close();
};

createAccount();