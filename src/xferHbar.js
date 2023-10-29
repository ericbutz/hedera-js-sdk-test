const {
  Client,
  AccountBalanceQuery,
  Hbar,
  TransferTransaction
} = require("@hashgraph/sdk");

require("dotenv").config({path:'../.env'});

async function xferHbar() {
  const myAccountId = process.env.MY_ACCOUNT_ID;
  const myPrivateKey = process.env.MY_PRIVATE_KEY;
  const payeeAccountId = process.env.USER_ACCOUNT_ID; 

  const hbarAmount = 1000 // hbar

  // 1 hbar = 100,000,000 tinybar
  const tinybarAmount = hbarAmount * 100000000;  // 100 hbar 

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

  //Request the cost of the account balance query
  const queryCost = await new AccountBalanceQuery()
  .setAccountId(myAccountId)
  .getCost(client);

  console.log("The cost of AccountBalanceQuery is: " + queryCost);

  //Verify the account balance
  const myAccountBalance = await new AccountBalanceQuery()
  .setAccountId(myAccountId)
  .execute(client);
  console.log(`Faucet ${myAccountId} initial account balance is: ${myAccountBalance.hbars} hbar`);

  const payeeAccountBalance = await new AccountBalanceQuery()
  .setAccountId(payeeAccountId)
  .execute(client);

  console.log(`Payee ${payeeAccountId} initial account balance is: ${payeeAccountBalance.hbars} hbar`);

  //Create the transfer transaction
  console.log(`Transfer ${hbarAmount} hbar from ${myAccountId} to ${payeeAccountId}`)
  const sendHbar = await new TransferTransaction()
    .addHbarTransfer(myAccountId, Hbar.fromTinybars(-tinybarAmount)) //Sending account
    .addHbarTransfer(payeeAccountId, Hbar.fromTinybars(tinybarAmount)) //Receiving account
    .execute(client);

  //Verify the transaction reached consensus
  const transactionReceipt = await sendHbar.getReceipt(client);
  console.log("Transaction ID: " + transactionReceipt.status.toString());

  //Check the new account's balance
  const getNewBalance = await new AccountBalanceQuery()
  .setAccountId(payeeAccountId)
  .execute(client);

  console.log(`Payee ${payeeAccountId} new account balance is: ${getNewBalance.hbars} hbar`);

  client.close();
};

xferHbar();