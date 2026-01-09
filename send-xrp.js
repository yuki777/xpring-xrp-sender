require('dotenv').config({quiet: true})
const { program } = require('commander')
const { Wallet, Client, xrpToDrops, isValidXAddress, isValidClassicAddress, xAddressToClassicAddress } = require('xrpl')

program.on('--help', function(){
  console.log('')
  console.log('Examples:')
  console.log('  node send-xrp.js -d rUas92gJndsSWhFCBbkH3N1yt8YztVfosA -t 4294967295 -a 0.000001')
  console.log('  node send-xrp.js -d X7buLrGJ71ir2wqWdpg7XUPwNT7EYRmUeHyYPNctFFo9Dqj -a 0.000001')
})
program
  .version('2.0.0')
  .option('-d, --destination <destination>', 'Destination xrp address (Classic or X-Address)')
  .option('-t, --tag [tag]', 'Destination tag (ignored if X-Address is used)')
  .option('-a, --amount <amount>', 'Send amount. 1 = 1 XRP.')

program.parse(process.argv);
const options = program.opts();

// Validate destination address (Classic or X-Address)
const isXAddress = isValidXAddress(options.destination);
const isClassic = isValidClassicAddress(options.destination);
if(!options.destination || (!isXAddress && !isClassic)) {
  program.help();
}
if(options.amount === undefined || isNaN(parseFloat(options.amount))) {
  program.help();
}

// Parse address and tag
let receiverClassicAddress;
let receiverTag;

if(isXAddress) {
  const decoded = xAddressToClassicAddress(options.destination);
  receiverClassicAddress = decoded.classicAddress;
  receiverTag = decoded.tag !== false ? decoded.tag : undefined;
} else {
  receiverClassicAddress = options.destination;
  receiverTag = options.tag ? parseInt(options.tag) : undefined;
}

const amount = parseFloat(options.amount);

async function send(){
  const senderWallet = Wallet.fromSeed(process.env.SENDER_SEED);
  const remoteURL = process.env.REMOTE_URL;
  const drops = xrpToDrops(amount);

  const client = new Client(remoteURL);
  await client.connect();

  const senderClassicAddress = senderWallet.classicAddress;

  console.log("Datetime : " + new Date().toISOString());
  console.log("Sender Classic Address : " + senderClassicAddress);
  console.log("Sender Address Explorer : " + process.env.EXPLORER_URL + "/accounts/" + senderClassicAddress);
  console.log("Send Amount (XRP) : " + amount);
  console.log("Send Amount (drop) : " + drops);
  console.log("Receiver Classic Address : " + receiverClassicAddress);
  if(receiverTag !== undefined) {
    console.log("Receiver Destination Tag : " + receiverTag);
    console.log("Receiver Address Explorer : " + process.env.EXPLORER_URL + "/accounts/" + receiverClassicAddress + "#" + receiverTag);
  } else {
    console.log("Receiver Address Explorer : " + process.env.EXPLORER_URL + "/accounts/" + receiverClassicAddress);
  }

  const payment = {
    TransactionType: 'Payment',
    Account: senderClassicAddress,
    Destination: receiverClassicAddress,
    Amount: drops
  };

  if(receiverTag !== undefined) {
    payment.DestinationTag = receiverTag;
  }

  try {
    const prepared = await client.autofill(payment);
    const signed = senderWallet.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);

    console.log("Transaction Hash : " + signed.hash);
    console.log("Transaction : " + process.env.EXPLORER_URL + "/transactions/" + signed.hash);
    console.log("Result : " + result.result.meta.TransactionResult);
  } catch (error) {
    console.error("Transaction failed:", error.message);
  } finally {
    await client.disconnect();
  }
}

send();
