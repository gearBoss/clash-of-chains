import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "ETH");

  if (balance === 0n) {
    console.error("ERROR: No ETH balance. Get Base Sepolia ETH from a faucet.");
    process.exit(1);
  }

  // Use deployer as the authorized signer (same key for testnet)
  const signerAddress = deployer.address;
  console.log("Authorized signer:", signerAddress);

  const ChainClashArena = await hre.ethers.getContractFactory("ChainClashArena");
  const arena = await ChainClashArena.deploy(signerAddress);
  await arena.waitForDeployment();

  const address = await arena.getAddress();
  console.log("");
  console.log("=".repeat(50));
  console.log("ChainClashArena deployed at:", address);
  console.log("Authorized signer:", signerAddress);
  console.log("Network: Base Sepolia");
  console.log("Explorer: https://sepolia.basescan.org/address/" + address);
  console.log("=".repeat(50));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
