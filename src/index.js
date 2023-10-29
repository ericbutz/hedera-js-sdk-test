const {
  Client,
  PrivateKey,
  AccountCreateTransaction,
  AccountBalanceQuery,
  Hbar,
  TransferTransaction,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  TopicMessageQuery
} = require("@hashgraph/sdk");

require("dotenv").config({path:'../.env'});

async function environmentSetup() {
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
  const newAccountPrivateKey = await PrivateKey.generateED25519Async(); 
  console.log('newAccountPrivateKey: ', newAccountPrivateKey);
  const newAccountPublicKey = newAccountPrivateKey.publicKey;
  console.log('newAccountPublicKey: ', newAccountPublicKey.toString());

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

  console.log("The new account balance is: " +accountBalance.hbars.toTinybars() +" tinybar.");

  //Create the transfer transaction
  const sendHbar = await new TransferTransaction()
    .addHbarTransfer(myAccountId, Hbar.fromTinybars(-1000)) //Sending account
    .addHbarTransfer(newAccountId, Hbar.fromTinybars(1000)) //Receiving account
    .execute(client);

  //Verify the transaction reached consensus
  const transactionReceipt = await sendHbar.getReceipt(client);
  console.log("The transfer transaction from my account to the new account was: " + transactionReceipt.status.toString());

  //Request the cost of the query
  const queryCost = await new AccountBalanceQuery()
  .setAccountId(newAccountId)
  .getCost(client);

  console.log("The cost of query is: " +queryCost);

  //Check the new account's balance
  const getNewBalance = await new AccountBalanceQuery()
  .setAccountId(newAccountId)
  .execute(client);

  console.log("The account balance after the transfer is: " +getNewBalance.hbars.toTinybars() +" tinybar.")

  // Create a new topic
  let txResponse = await new TopicCreateTransaction().execute(client);

  // Grab the newly generated topic ID
  let receipt = await txResponse.getReceipt(client);
  let topicId = receipt.topicId;
  console.log(`Your topic ID is: ${topicId}`);

  // Wait 5 seconds between consensus topic creation and subscription creation
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // Subscribe to the topic
  new TopicMessageQuery()
  .setTopicId(topicId)
  .subscribe(client, null, (message) => {
    let messageAsString = Buffer.from(message.contents, "utf8").toString();
    console.log(
      `${message.consensusTimestamp.toDate()} Received: ${messageAsString}`
    );
  });

  // Send message to the topic
  let sendResponse = await new TopicMessageSubmitTransaction({
    topicId: topicId,
    message: "Hello, HCS!",
  }).execute(client);

  // Get the receipt of the transaction
  const msgReceipt = await sendResponse.getReceipt(client);

  // Get the status of the transaction
  const transactionStatus = msgReceipt.status
  console.log("The message transaction status " + transactionStatus.toString())


  // Now submit 3 messages
  await new TopicMessageSubmitTransaction({
    topicId: topicId,
    message: "Message 1",
  }).execute(client);

  await new TopicMessageSubmitTransaction({
    topicId: topicId,
    message: "Message 2",
  }).execute(client);

  await new TopicMessageSubmitTransaction({
    topicId: topicId,
    message: "Message 3",
  }).execute(client);

  /** 
   * You can now query the Testnet server with the following:
   *  
   * Replace <topicId>
   * https://testnet.mirrornode.hedera.com/api/v1/topics/<topicID>/messages
   * 
   * https://testnet.mirrornode.hedera.com/api/v1/topics/<topicID>/messages?sequencenumber=2
   * 
   * With greater than or equal modifier
   * https://testnet.mirrornode.hedera.com/api/v1/topics/<topicID>/messages?sequencenumber=gte:2
   * 
  */


};

environmentSetup();