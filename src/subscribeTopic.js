const {
  Client,
  Hbar,
  TopicInfoQuery,
  TopicMessageQuery
} = require("@hashgraph/sdk");

require("dotenv").config({path:'../.env'});

async function subscribeTopic() {
  //Grab your Hedera testnet account ID and private key from your .env file
  const myAccountId = process.env.MY_ACCOUNT_ID;
  const myPrivateKey = process.env.MY_PRIVATE_KEY;
  const topicId = process.env.TOPIC_ID;

  // If we weren't able to grab it, we should throw a new error
  if (!myAccountId || !myPrivateKey) {
    throw new Error(
      "Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present"
    );
  }
  
  //Create your Hedera Testnet client
  const client = Client.forTestnet();

  client.setOperator(myAccountId, myPrivateKey);
  client.setDefaultMaxTransactionFee(new Hbar(100));
  client.setDefaultMaxQueryPayment(new Hbar(50));

  // Get topic info
  const query = new TopicInfoQuery()
    .setTopicId(topicId);
  const info = await query.execute(client);
  console.log("Topic memo: " + info.topicMemo);
  console.log("Topic ID: " + info.topicId);

  //Subscribe to the topic. This will return all of the messages decoded from base64
  new TopicMessageQuery()
  .setTopicId(topicId)
  .setStartTime(0)
  .subscribe(
    client, 
    (message) => console.log(Buffer.from(message.contents, "utf8").toString())
  );

  client.close();
};

subscribeTopic();