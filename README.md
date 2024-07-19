# Create2 Example Using OpenZeppelin

Updated example of OpenZeppelin Create2 library using Solidity `0.8.24` and OZ v `5.0.2`

```sh
git clone https://github.com/TtheBC01/create2-example.git
cd create2-example
npm install
```

## Run Tests

```sh
npx hardhat test
```

## Deploying the Vault Factory

```sh
npx hardhat ignition deploy ignition/modules/Apollo.ts --network sepolia --strategy create2
```