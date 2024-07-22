// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.24;

import "./Vault.sol";
import "@openzeppelin/contracts/utils/Create2.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import {BeaconProxy} from "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import {UpgradeableBeacon} from "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";

contract VaultFactory {
    event VaultCreated(address vault);

    // the address of the beacon should never change for this upgrade pattern
    address public immutable beaconAddress;

    constructor(address owner){
        // Deploy an instance of a Vault to use as the implementation contract
        Vault vaultImpl = new Vault();
        vaultImpl.initialize(payable(owner));

        // Deploy the Upgradeable Beacon that points to the implementation Vault contract address
        // https://docs.openzeppelin.com/contracts/3.x/api/proxy#UpgradeableProxy
        // All deployed proxies can be upgraded by changing the implementation address in the beacon
        UpgradeableBeacon _upgradeableBeacon = new UpgradeableBeacon{salt: keccak256("create2-upgradeable-beacon-example")}(address(vaultImpl), owner);
        beaconAddress = address(_upgradeableBeacon);
    }
    
    /// @notice uses OZ Create2 library to deploy a Vault at deterministic address
    /// @param name a string used to name the Vault deployed to make it easy to look up (hashed to create salt)
    /// @param owner an address that will own the Vault contract
    function deployVaultWithCreate2(string memory name, address payable owner) public {
        address vaultAddress;

        vaultAddress = Create2.deploy(0, keccak256(abi.encodePacked(name)), type(Vault).creationCode);
        Vault(vaultAddress).initialize(owner);
        
        emit VaultCreated(vaultAddress);
    }

    /// @notice uses New keyword with salt value to deploy a Vault at deterministic address
    /// @dev https://docs.soliditylang.org/en/v0.8.26/control-structures.html#creating-contracts-via-new
    /// @param name a string used to name the Vault deployed to make it easy to look up (hashed to create salt)
    /// @param owner an address that will own the Vault contract
    function deployVaultWithNewSalt(string memory name, address payable owner) public {
        Vault vault = new Vault{salt: keccak256(abi.encodePacked(name))}();
        vault.initialize(owner);
        
        emit VaultCreated(address(vault));
    }

    /// @notice deployes a Beacon Proxy with New keyword and salt to create an upgradeable Vault
    /// @dev https://docs.openzeppelin.com/contracts/5.x/api/proxy#UpgradeableBeacon
    /// @param name a string used to name the Vault deployed to make it easy to look up (hashed to create salt)
    /// @param owner an address that will own the Vault contract
    function deployVaultUpgradeableBeacon(string memory name, address payable owner) public {
        /// NOTE: The address of the beacon contract will never change after deployment. Additionally, in this example we call 
        /// the initializer after deployment so that the proxy address does not depend on the initializer arguments. The means you only
        /// need to use the salt value to calculate the proxy address.
        BeaconProxy proxy = new BeaconProxy{salt: keccak256(abi.encodePacked(name))}(beaconAddress,  '');
        Vault(address(proxy)).initialize(owner);
        
        emit VaultCreated(address(proxy));
    }

    /// @notice Compute the address that a Vault will be/is deployed to
    /// @param name the string that was used for the Vault salt value
    function computeVaultAddress(string memory name) public view returns (address) {
        return Create2.computeAddress(keccak256(abi.encodePacked(name)), keccak256(type(Vault).creationCode));
    }

    /// @notice Compute the address that a Proxy will be/is deployed to
    /// @param name the string that was used for the Vault salt value
    function computeProxyAddress(string memory name) public view returns (address) {
        return Create2.computeAddress(keccak256(abi.encodePacked(name)), keccak256(abi.encodePacked(type(BeaconProxy).creationCode, abi.encode(beaconAddress,''))));
    }
    
    /// @notice send some ETH to the address that a Vault will be/is deployed to 
    /// @param name the string used as the salt vaule for the Vault
    function sendValue(string memory name) external payable {
        address vaultAddress;
        
        vaultAddress = Create2.computeAddress(keccak256(abi.encodePacked(name)), keccak256(type(Vault).creationCode));
        
        Address.sendValue(payable(vaultAddress), msg.value); 
    }
}