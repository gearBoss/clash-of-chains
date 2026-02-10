// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/ChainClashArena.sol";

contract DeployChainClash is Script {
    function run() external {
        uint256 deployerPk = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address signer = vm.envAddress("ANCHOR_SIGNER_ADDRESS");

        vm.startBroadcast(deployerPk);

        ChainClashArena arena = new ChainClashArena(signer);

        vm.stopBroadcast();

        console.log("ChainClashArena deployed at:", address(arena));
        console.log("Authorized signer:", signer);
    }
}
