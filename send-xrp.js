require('dotenv').config()
const dayjs = require('dayjs')
const { program } = require('commander')
const { Wallet, Client, xrpToDrops, dropsToXrp } = require('xrpl')

program.on('--help', function(){
  console.log('')
  console.log('Examples:')
  console.log('  node send-xrp.js -d rUas92gJndsSWhFCBbkH3N1yt8YztVfosA -t 4294967295 -a 0.000001')
})
program
  .version('1.0.0')
  .option('-d, --destination <destination>', 'Destination xrp address')
  .option('-t, --tag [tag]', 'Destination tag')
  .option('-a, --amount <amount>', 'Send amount. 1 = 1 XRP.')

program.parse(process.argv);
const options = program.opts();

if(!options.destination || !options.destination.match(/^r[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{24,34}$/)) {
  program.help();
}
if(options.amount === undefined || isNaN(parseFloat(options.amount))) {
  program.help();
}

const receiverClassicAddress = options.destination;
const receiverTag = options.tag ? parseInt(options.tag) : undefined;
const amount = parseFloat(options.amount);

async function send(){
  const senderWallet = Wallet.fromSeed(process.env.SENDER_SEED);
  const remoteURL = process.env.REMOTE_URL;
  const drops = xrpToDrops(amount);

  const client = new Client(remoteURL);
  await client.connect();

  const senderClassicAddress = senderWallet.classicAddress;

  console.log("Datetime : " + dayjs().format());
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
