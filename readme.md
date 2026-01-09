# send-xrp.js

## Install

```bash
npm install
```

## Send XRP on Testnet

```bash
# Create sender/receiver address on Testnet
curl -s -X POST 'https://faucet.altnet.rippletest.net/accounts' | jq

# Edit .env
cp .env.testnet .env

# Send XRP
node send-xrp.js --help

# Examples
node send-xrp.js -d X7buLrGJ71ir2wqWdpg7XUPwNT7EYRmUeHyYPNctFFo9Dqj -a 0.000001 # xAddress
node send-xrp.js -d rsZgx1mMCSxAH1XFVdBKg5Dw6u8KyPdFsR -t 1234567890 -a 0.000001 # classicAddress
```

## Send XRP on Mainnet

```bash
# Edit .env
cp .env.mainnet .env

# Send XRP
node send-xrp.js --help
```
