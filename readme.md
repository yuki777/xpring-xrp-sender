# send-xrp.js

## Install

```bash
npm install
```

## Send XRP on Testnet

```bash
# Create address on Testnet
curl -s -X POST 'https://faucet.altnet.rippletest.net/accounts' | jq

cp .env.testnet .env # => Edit .env
node send-xrp.js --help
```

## Send XRP on Mainnet

```bash
cp .env.mainnet .env # => Edit .env
node send-xrp.js --help
```
