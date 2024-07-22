# Create2 Example Using OpenZeppelin and Hardhat

Updated example of OpenZeppelin [Create2](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Create2.sol) 
library using Solidity `0.8.24` and OZ v `5.0.2` using the Hardhat framework. 

This demo shows how to use Create2 to deploy a vanilla Vault contract as well as an upgradeable Vault via an Upgradeable Beacon.

Check out [CreateX](https://createx.rocks/) while you are researching this topic.

```sh
git clone https://github.com/TtheBC01/create2-example.git
cd create2-example
npm install
```

## Setup you ENV file

```sh
cp .env-sample .env
```

Then add add either a private key or mnemonic with testnet funds if you want to deploy to a testnet.

This example has already been deployed to Fuji and Sepolia testnets, so you'll need to change the salt value or the owner address to something else if you want
to try that yourself. 

## Run Tests

```sh
npx hardhat test
```

## Deploying the Vault Factory

Change the `owner` address in the [Vault.ts](/ignition/modules/Vault.ts#L5) module to an account you control before deploying:

```sh
npx hardhat ignition deploy ignition/modules/VaultFactory.ts --network sepolia --strategy create2
```

VaultFactory address on [fuji](https://testnet.snowtrace.io/address/0x0568846C86B727Ba76794fF1bFD0713384d879ab) and [sepolia](https://sepolia.etherscan.io/address/0x0568846C86B727Ba76794fF1bFD0713384d879ab): `0x0568846C86B727Ba76794fF1bFD0713384d879ab`

## Hardhat Tasks

```sh
# predict the address of a proxy Vault
npx hardhat getProxyAddress --name TtheBC01 --network fuji
# predict the address of a regular Vault
npx hardhat getVaultAddress --name TtheBC01 --network fuji

# deploy a proxy Vault (change the owner and name to what you want)
npx hardhat deployProxy --name TtheBC01 --owner 0x9fEad8B19C044C2f404dac38B925Ea16ADaa2954 --network fuji
# deploy a regular Vault (change the owner and name to what you want)
npx hardhat deployVault --name TtheBC01 --owner 0x9fEad8B19C044C2f404dac38B925Ea16ADaa2954 --network fuji

# check the owner address of a proxy Vault
npx hardhat getProxyOwner --name TtheBC01 --network sepolia
# check the owner address of a regular Vault
npx hardhat getVaultOwner --name TtheBC01 --network sepolia
```