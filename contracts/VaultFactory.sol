// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.24;

import "./Vault.sol";
import "@openzeppelin/contracts/utils/Create2.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract VaultFactory {
    event VaultCreated(address vault);
    
    function deployVault(string memory name, address payable owner) public {
        address vaultAddress;

        vaultAddress = Create2.deploy(0, keccak256(abi.encodePacked(name)), type(Vault).creationCode);
        Vault(vaultAddress).initialize(owner);
        
        emit VaultCreated(vaultAddress);
    }

    function computeAddress(string memory name) public view returns (address) {
        return Create2.computeAddress(keccak256(abi.encodePacked(name)), keccak256(type(Vault).creationCode));
    }
    
    function sendValue(string memory name) external payable {
        address vaultAddress;
        
        vaultAddress = Create2.computeAddress(keccak256(abi.encodePacked(name)), keccak256(type(Vault).creationCode));
        
        Address.sendValue(payable(vaultAddress), msg.value); 
    }
}