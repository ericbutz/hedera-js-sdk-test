const {
  Client,
  AccountBalanceQuery,
  Hbar,
  TopicMessageSubmitTransaction
} = require("@hashgraph/sdk");
const { createHmac, randomBytes } = require('node:crypto');

require("dotenv").config({path:'../.env'});

async function createMessage() {
  const accountId = process.env.USER_ACCOUNT_ID;
  const privateKey = process.env.USER_PRIVATE_KEY;
  const topicId = process.env.TOPIC_ID;

  const rndString = randomBytes(20).toString('hex');
  const productHash = createHmac('sha256', rndString)
               .digest('hex');
  console.log('Product hash: ' + productHash.toString());

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
  console.log("The account balance is: " +accountBalance.hbars.toTinybars() +" tinybar.");

  console.log(`Topic ID is: ${topicId}`);

  // Send message to the topic
  let sendResponse = await new TopicMessageSubmitTransaction({
    topicId: topicId,
    message: "hello world",
  }).execute(client);

  // Get the receipt of the transaction
  const msgReceipt = await sendResponse.getReceipt(client);
  console.log("Message receipt: " + msgReceipt)

  // Get the status of the transaction
  const transactionStatus = msgReceipt.status
  console.log("Message transaction status " + transactionStatus.toString())

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

  client.close();
};

createMessage();