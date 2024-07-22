import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const VaultModule = buildModule("VaultModule", (m) => {

  const owner = '0x9fEad8B19C044C2f404dac38B925Ea16ADaa2954';

  const vault = m.contract("VaultFactory", [owner], {});

  return { vault };
});

export default VaultModule;
