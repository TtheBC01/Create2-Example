import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { keccak256 } from "viem";
import VaultArtifact from "../artifacts/contracts/Vault.sol/Vault.json";



// Function to compute CREATE2 address
function computeCreate2Address(deployerAddress: string, saltString: string, bytecode: `0x${string}`): string {
  return `0x${keccak256(
    `0x${['ff', deployerAddress, keccak256(Buffer.from(saltString)), keccak256(bytecode)].map((x) => x.replace(/0x/, '')).join('')}`
  ).slice(-40)
    }`.toLocaleLowerCase();
}

describe("Vault", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployVaultFactory() {

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await hre.viem.getWalletClients();

    const vaultFactory = await hre.viem.deployContract("VaultFactory", [owner.account.address]);

    const publicClient = await hre.viem.getPublicClient();

    const create2Address = computeCreate2Address(vaultFactory.address, 'TtheBC01', `0x${VaultArtifact.bytecode.slice(2,)}`);

    return {
      vaultFactory,
      owner,
      otherAccount,
      publicClient,
      create2Address,
    };
  }

  describe("Test Vault Factory Functions", function () {
    it("Check that predicted off-chain and on-chain addresses match", async function () {
      const { vaultFactory, create2Address } = await loadFixture(deployVaultFactory);

      expect((await vaultFactory.read.computeVaultAddress(['TtheBC01'])).toLocaleLowerCase()).to.equal(create2Address);
    });

    it("Deploy Vault with Create2 and check event", async function () {
      const { vaultFactory, owner, publicClient, create2Address } =
        await loadFixture(deployVaultFactory);

      const hash = await vaultFactory.write.deployVaultWithCreate2(['TtheBC01', owner.account.address]);
      await publicClient.waitForTransactionReceipt({ hash });

      // get the withdrawal events in the latest block
      const deploymentEvents = await vaultFactory.getEvents.VaultCreated();
      expect(deploymentEvents).to.have.lengthOf(1);
      expect(deploymentEvents[0].args.vault?.toLocaleLowerCase()).to.equal(create2Address);

      const vault = await hre.viem.getContractAt("Vault", create2Address);
      expect((await vault.read.getOwner()).toLocaleLowerCase()).to.equal(owner.account.address.toLocaleLowerCase());
    });

    it("Deploy Vault with New and salt and check event", async function () {
      const { vaultFactory, owner, publicClient, create2Address } =
        await loadFixture(deployVaultFactory);

      const hash = await vaultFactory.write.deployVaultWithNewSalt(['TtheBC01', owner.account.address]);
      await publicClient.waitForTransactionReceipt({ hash });

      // get the withdrawal events in the latest block
      const deploymentEvents = await vaultFactory.getEvents.VaultCreated();
      expect(deploymentEvents).to.have.lengthOf(1);
      expect(deploymentEvents[0].args.vault?.toLocaleLowerCase()).to.equal(create2Address);

      const vault = await hre.viem.getContractAt("Vault", create2Address);
      expect((await vault.read.getOwner()).toLocaleLowerCase()).to.equal(owner.account.address.toLocaleLowerCase());
    });

    it("Deploy Vault Proxy with New and salt and check event", async function () {
      const { vaultFactory, owner, publicClient } =
        await loadFixture(deployVaultFactory);

      const hash = await vaultFactory.write.deployVaultUpgradeableBeacon(['TtheBC01', owner.account.address]);
      await publicClient.waitForTransactionReceipt({ hash });

      const create2Address = await vaultFactory.read.computeProxyAddress(['TtheBC01'])

      // get the withdrawal events in the latest block
      const deploymentEvents = await vaultFactory.getEvents.VaultCreated();
      expect(deploymentEvents).to.have.lengthOf(1);
      expect(deploymentEvents[0].args.vault?.toLocaleLowerCase()).to.equal(create2Address.toLocaleLowerCase());

      const vault = await hre.viem.getContractAt("Vault", create2Address);
      expect((await vault.read.getOwner()).toLocaleLowerCase()).to.equal(owner.account.address.toLocaleLowerCase());
    });

    it("Cannot deploy to the same address twice", async function () {
      const { vaultFactory, owner, publicClient } =
        await loadFixture(deployVaultFactory);

      const hash = await vaultFactory.write.deployVaultWithCreate2(['TtheBC01', owner.account.address]);
      await publicClient.waitForTransactionReceipt({ hash });

      await expect(vaultFactory.write.deployVaultWithCreate2(['TtheBC01', owner.account.address])).to.be.rejectedWith('Create2FailedDeployment()')
    });

    it("Send Eth to a Vault before its created then withdraw it", async function () {
      const { vaultFactory, owner, publicClient, create2Address } =
        await loadFixture(deployVaultFactory);

      await owner.sendTransaction({
        to: create2Address.toString(),
        value: 1000000000000000000n // 1 ETH
      })

      const hash = await vaultFactory.write.deployVaultWithCreate2(['TtheBC01', owner.account.address]);
      await publicClient.waitForTransactionReceipt({ hash });

      const vault = await hre.viem.getContractAt("Vault", create2Address);
      await vault.write.withdraw();
      expect(await publicClient.getBalance({ address: vault.address })).to.eql(0n);
    });

    it("Send Eth to a Proxy before its created then withdraw it", async function () {
      const { vaultFactory, owner, publicClient } =
        await loadFixture(deployVaultFactory);

      const create2Address = await vaultFactory.read.computeProxyAddress(['TtheBC01']);

      await owner.sendTransaction({
        to: create2Address.toString(),
        value: 1000000000000000000n // 1 ETH
      })

      const hash = await vaultFactory.write.deployVaultUpgradeableBeacon(['TtheBC01', owner.account.address]);
      await publicClient.waitForTransactionReceipt({ hash });

      const vault = await hre.viem.getContractAt("Vault", create2Address);
      await vault.write.withdraw();
      expect(await publicClient.getBalance({ address: vault.address })).to.eql(0n);
    });
  });
});
