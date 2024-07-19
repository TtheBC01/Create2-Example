# Create2 Example Using OpenZeppelin and Hardhat

Updated example of OpenZeppelin Create2 library using Solidity `0.8.24` and OZ v `5.0.2` using the Hardhat framework. 

```sh
git clone https://github.com/TtheBC01/create2-example.git
cd create2-example
npm install
```

## Setup you ENV file

```sh
cp .env-sample .env
```

Then add an RPC endpoint to `ETH_PROVIDER_URL` and also add either a private key or mnemonic with funds if you want to deploy to a testnet. 

## Run Tests

```sh
npx hardhat test
```

## Deploying the Vault Factory

```sh
npx hardhat ignition deploy ignition/modules/Vault.ts --network sepolia --strategy create2
```