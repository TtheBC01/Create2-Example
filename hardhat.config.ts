import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import "./tasks/utils";

require("dotenv").config();

// seed phrase for your HD wallet
const mnemonic =
  process.env.MNEMONIC ||
  "test test test test test test test test test test test junk";

// alternative to mnemonic, set a specific private key
const key = process.env.ETH_PRIVATE_KEY;

// if no private key is found in .env, use the public known mnemonic
const accounts = key ? [key] : { mnemonic };

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  ignition: {
    strategyConfig: {
      create2: {
        // To learn more about salts, see the CreateX documentation
        // the current value is equal to keccak256('create2-example')
        salt: "0xedb933ff42a22ca1d4b81b32c60e1a665226129bb8e8b488981e9ecbb6f6bac6",
      },
    },
  },
  networks: {
    fuji: {
      url: 'https://rpc.ankr.com/avalanche_fuji',
      accounts: accounts,
    },
    sepolia: {
      url: 'https://rpc.ankr.com/eth_sepolia',
      accounts: accounts,
    },
  }
};

export default config;
