import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { getAddress, parseGwei } from "viem";

describe("Vault", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployVaultFactory() {

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await hre.viem.getWalletClients();

    const vaultFactory = await hre.viem.deployContract("VaultFactory", []);

    const publicClient = await hre.viem.getPublicClient();

    return {
      vaultFactory,
      owner,
      otherAccount,
      publicClient,
    };
  }

  describe("Test Vault Factory Functions", function () {
    it("Should set the right unlockTime", async function () {
      const { vaultFactory, owner } = await loadFixture(deployVaultFactory);

      expect(await vaultFactory.read.computeAddress(['TtheBC01'])).to.equal('0xCB5bF197214B12b47e173fa0A991d050D87Bb34d');
    });

    it("Deploy Vault and check event", async function () {
      const { vaultFactory, owner, publicClient } =
        await loadFixture(deployVaultFactory);

      const hash = await vaultFactory.write.deployVault(['TtheBC01', owner.account.address]);
      await publicClient.waitForTransactionReceipt({ hash });

      // get the withdrawal events in the latest block
      const deploymentEvents = await vaultFactory.getEvents.VaultCreated();
      expect(deploymentEvents).to.have.lengthOf(1);
      expect(deploymentEvents[0].args.vault).to.equal('0xCB5bF197214B12b47e173fa0A991d050D87Bb34d');

      const vault = await hre.viem.getContractAt("Vault", '0xCB5bF197214B12b47e173fa0A991d050D87Bb34d');
      expect((await vault.read.getOwner()).toLocaleLowerCase()).to.equal(owner.account.address.toLocaleLowerCase());
    });

    it("Cannot deploy to the same address twice", async function () {
      const { vaultFactory, owner, publicClient } =
        await loadFixture(deployVaultFactory);

      const hash = await vaultFactory.write.deployVault(['TtheBC01', owner.account.address]);
      await publicClient.waitForTransactionReceipt({ hash });

      await expect(vaultFactory.write.deployVault(['TtheBC01', owner.account.address])).to.be.rejectedWith('Create2FailedDeployment()')
    });
  });
});
