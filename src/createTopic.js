const {
  Client,
  AccountBalanceQuery,
  Hbar,
  TopicCreateTransaction
} = require("@hashgraph/sdk");

require("dotenv").config({path:'../.env'});

async function createTopic() {
  const accountId = process.env.TRUSS_ACCOUNT_ID;
  const privateKey = process.env.TRUSS_PRIVATE_KEY;

  const memo = "Truss Security Testnet products"

  // If we weren't able to grab it, we should throw a new error
  if (!accountId || !privateKey) {
    throw new Error(
      "Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present"
    );
  }
  
  //Create your Hedera Testnet client
  const client = Client.forTestnet();

  client.setOperator(accountId, privateKey);
  client.setDefaultMaxTransactionFee(new Hbar(100));
  client.setDefaultMaxQueryPayment(new Hbar(50));

  //Verify the account balance
  const accountBalance = await new AccountBalanceQuery()
  .setAccountId(accountId)
  .execute(client);

  console.log("The new account balance is: " +accountBalance.hbars.toTinybars() +" tinybar.");

  // Create a new topic
  let txResponse = await new TopicCreateTransaction()
    .setTopicMemo(memo)
    .setAutoRenewPeriod(8000001)   // 92 days
    .execute(client);

  // Grab the newly generated topic ID
  let receipt = await txResponse.getReceipt(client);
  let topicId = receipt.topicId;
  console.log(`Topic ID is: ${topicId}`);

  client.close();
};

createTopic();