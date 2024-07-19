import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseEther } from "viem";

const VaultModule = buildModule("VaultModule", (m) => {

  const vault = m.contract("Vault", [], {
    salt: "create2-example"
  });

  return { vault };
});

export default VaultModule;
