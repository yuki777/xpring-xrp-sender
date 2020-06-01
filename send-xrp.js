require('dotenv').config()
const moment = require('moment')
const program = require('commander')
const { Wallet, XRPClient, XRPLNetwork, Utils } = require("xpring-js");

program.on('--help', function(){
  console.log('')
  console.log('Examples:')
  console.log('  node mainnet-send-xrp.js -d rUas92gJndsSWhFCBbkH3N1yt8YztVfosA -t 4294967295 -a 0.000001')
})
program
  .version('0.9.0')
  .option('-d, --destination <destination>', 'Destination xrp address', /^r[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{24,34}$/, false)
  .option('-t, --tag [tag]', 'Destination tag', /^[0-9]{1,10}$/, null)
  .option('-a, --amount <amount>', 'Send amount. 1 = 1 XRP.', parseFloat, false)

program.parse(process.argv);
if(program.destination === false) program.help();
if(program.tag === false) program.help();
if(program.amount === false) program.help();

const receiverClassicAddress = program.destination;
const receiverTag = program.tag;
const amount = program.amount;

async function send(){
  const senderWallet = Wallet.generateWalletFromSeed(process.env.SENDER_SEED);
  const remoteURL = process.env.REMOTE_URL;
  const drop = BigInt((Math.round(amount*1000000)).toString()); // 1XRP = 1,000,000drop
  const xrpClient = new XRPClient(remoteURL);
  const senderXAddress = senderWallet.getAddress();
  const senderClassicAddress = Utils.decodeXAddress(senderXAddress);
  const receiverXAddress = Utils.encodeXAddress(receiverClassicAddress, receiverTag);

  console.log("Datetime : " + moment().format());
  console.log("Sender X Address : " + senderXAddress);
  console.log("Sender Classic Address : " + senderClassicAddress.address);
  console.log("Sender Address Explorer : " + process.env.EXPLORER_URL + "/accounts/" + senderClassicAddress.address);
  console.log("Send Amount (XRP) : " + amount);
  console.log("Send Amount (drop) : " + drop);
  console.log("Receiver X Address : " + receiverXAddress);
  console.log("Receiver Classic Address : " + receiverClassicAddress);
  console.log("Receiver Classic Address Tag : " + receiverTag);
  console.log("Receiver Address Explorer : " + process.env.EXPLORER_URL + "/accounts/" + receiverClassicAddress + "#" + receiverTag);

  const transactionHash = await xrpClient.send(drop, receiverXAddress, senderWallet);
  console.log("Transaction : " + process.env.EXPLORER_URL + "/transactions/" + transactionHash);
}
send();
