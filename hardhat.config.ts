import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";

require("dotenv").config();

const urlOverride = process.env.ETH_PROVIDER_URL;

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
        salt: "0x0000000000000000000000000000000000000000000000000000000000000001",
      },
    },
  },
  networks: {
    fuji: {
      url: urlOverride,
      accounts: accounts,
    },
  }
};

export default config;
