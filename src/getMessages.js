const fetch = require('node-fetch');
require("dotenv").config({path:'../.env'});

const url = "https://testnet.mirrornode.hedera.com/api/v1"

async function getMessages() {

  const topicId = process.env.TOPIC_ID;

  // Call API to get messages
  const response = await fetch(`${url}/topics/${topicId}/messages`);
  const products = await response.json();
  console.log(products);

  /**
   * The message field is encoded in base64 format with a utf8 source character set.
   * Use built in atob() to decode. It returns the decoded binary data as a string.
   */
  products.messages.map((message) => console.log(`Message for ${message.sequence_number} is: ${atob(message.message)}`));


  /** 
   * You can query the Testnet server with the following:
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

getMessages();