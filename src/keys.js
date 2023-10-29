const {
  Client,
  PrivateKey
} = require("@hashgraph/sdk");

require("dotenv").config({path:'../.env'});

async function keys() {

  // ECDSA

  /** 
   * PrivateKey.generateECDSA() returns privateKey and publicKey uint8array buffers
   * A Uint8 array is an array of integers from 0-255 (8 bits). E.g.: [42, 252, 89]
   * There are 32 bytes for the private key and 32 for the public key.
  */
  const privateKey = await PrivateKey.generateECDSA()
  console.log('DER encoded Private Key: ' + privateKey)

  const publicKey = privateKey.publicKey;
  console.log('DER Encoded Public Key: ' + publicKey)


  // console.log('newAccountPrivateKey: ', newAccountPrivateKey._key._key._keyPair.privateKey)
  // console.log('newAccountPrivateKey: ', newAccountPrivateKey.get)
  // console.log('newAccountPrivateKey: ', newAccountPrivateKey.publicKey)
  // console.log('newAccountPrivateKey type: ', typeof newAccountPrivateKey._key._key._keyPair)
  //console.log(JSON.stringify(newAccountPrivateKey, null, 4))

  //let hex = Buffer.from(newAccountPrivateKey).toString('hex');

  // console.log('hex: ', hex)

  /**
   * You can convert it to hex
   */

  // const keys = Buffer.from(newAccountPrivateKey);

  // console.log('keyse: ', keys)

  // // DER Encoded Private Key (I think)
  // const derPrivateKey = newAccountPrivateKey.toString()
  // console.log('DER Encoded Private Key: ', derPrivateKey)


  // console.log(JSON.stringify(newAccountPrivateKey, null, 4))
};

keys();