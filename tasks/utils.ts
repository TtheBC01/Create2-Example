import { formatEther } from 'viem';

const FACTORY = "0x0568846C86B727Ba76794fF1bFD0713384d879ab";

task("accounts", "Prints the list of accounts for the configured environment")
    .setAction(async () => {
        const accounts = await hre.viem.getWalletClients();
        const publicClient = await hre.viem.getPublicClient();

        for (const account of accounts) {
            let accountBalance = await publicClient.getBalance({ address: account.account.address });
            console.log(
                "address:",
                account.account.address,
                "balance:",
                formatEther(accountBalance),
            );
        }
    });

task("getProxyAddress", "Prints the list of accounts for the configured environment")
    .addParam("name", "Name of the Proxy Vault")
    .setAction(async (taskargs) => {
        const factory = await hre.viem.getContractAt("VaultFactory", FACTORY);
        const proxyAddress = await factory.read.computeProxyAddress([taskargs.name]);
        console.log("Proxy Address:", proxyAddress);
    });

task("getVaultAddress", "Prints the list of accounts for the configured environment")
    .addParam("name", "Name of the Proxy Vault")
    .setAction(async (taskargs) => {
        const factory = await hre.viem.getContractAt("VaultFactory", FACTORY);
        const vaultAddress = await factory.read.computeVaultAddress([taskargs.name]);
        console.log("Proxy Address:", vaultAddress);
    });

task("deployProxy", "Deploy a new proxy vault")
    .addParam("name", "Name of the Proxy Vault")
    .addParam("owner", "Address that will own the proxy Vault")
    .setAction(async (taskargs) => {
        const publicClient = await hre.viem.getPublicClient();
        const factory = await hre.viem.getContractAt("VaultFactory", FACTORY);
        const hash = await factory.write.deployVaultUpgradeableBeacon([taskargs.name, taskargs.owner]);
        await publicClient.waitForTransactionReceipt({ hash });
        const proxyAddress = await factory.read.computeProxyAddress([taskargs.name]);
        console.log("Proxy Address:", proxyAddress);
    });

task("deployVault", "Deploy a new vault (no proxy)")
    .addParam("name", "Name of the Vault")
    .addParam("owner", "Address that will own the Vault")
    .setAction(async (taskargs) => {
        const publicClient = await hre.viem.getPublicClient();
        const factory = await hre.viem.getContractAt("VaultFactory", FACTORY);
        const hash = await factory.write.deployVaultWithNewSalt([taskargs.name, taskargs.owner]);
        await publicClient.waitForTransactionReceipt({ hash });
        const proxyAddress = await factory.read.computeVaultAddress([taskargs.name]);
        console.log("Proxy Address:", proxyAddress);
    });

task("getProxyOwner", "Prints the list of accounts for the configured environment")
    .addParam("name", "Name of the Proxy Vault")
    .setAction(async (taskargs) => {
        const factory = await hre.viem.getContractAt("VaultFactory", FACTORY);
        const proxyAddress = await factory.read.computeProxyAddress([taskargs.name]);
        const proxy = await hre.viem.getContractAt("Vault", proxyAddress);
        console.log("Proxy Address:", await proxy.read.getOwner());
    });

task("getVaultOwner", "Prints the list of accounts for the configured environment")
    .addParam("name", "Name of the Proxy Vault")
    .setAction(async (taskargs) => {
        const factory = await hre.viem.getContractAt("VaultFactory", FACTORY);
        const vaultAddress = await factory.read.computeVaultAddress([taskargs.name]);
        const vault = await hre.viem.getContractAt("Vault", vaultAddress);
        console.log("Proxy Address:", await vault.read.getOwner());
    });