import { createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!privateKey) {
    console.error("ERROR: Set DEPLOYER_PRIVATE_KEY env var");
    process.exit(1);
  }

  const account = privateKeyToAccount(privateKey);
  console.log("Deploying with account:", account.address);

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http("https://sepolia.base.org"),
  });

  const walletClient = createWalletClient({
    account,
    chain: baseSepolia,
    transport: http("https://sepolia.base.org"),
  });

  const balance = await publicClient.getBalance({ address: account.address });
  console.log("Balance:", Number(balance) / 1e18, "ETH");

  if (balance === 0n) {
    console.error("ERROR: No ETH balance. Get Base Sepolia ETH from a faucet.");
    process.exit(1);
  }

  // Read compiled artifact
  const artifactPath = join(__dirname, "../artifacts/contracts/ChainClashArena.sol/ChainClashArena.json");
  const artifact = JSON.parse(readFileSync(artifactPath, "utf8"));
  
  const bytecode = artifact.bytecode;
  const abi = artifact.abi;

  // Constructor takes authorizedSigner address - use deployer
  const signerAddress = account.address;
  console.log("Authorized signer:", signerAddress);

  // Encode constructor argument
  const { encodeAbiParameters } = await import("viem");
  const constructorArgs = encodeAbiParameters(
    [{ type: "address" }],
    [signerAddress]
  );

  const deployData = (bytecode + constructorArgs.slice(2));

  console.log("Deploying ChainClashArena...");

  const hash = await walletClient.deployContract({
    abi,
    bytecode: deployData,
    args: [signerAddress],
  });

  console.log("Transaction hash:", hash);
  console.log("Waiting for confirmation...");

  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  console.log("");
  console.log("=".repeat(50));
  console.log("ChainClashArena deployed at:", receipt.contractAddress);
  console.log("Authorized signer:", signerAddress);
  console.log("Network: Base Sepolia");
  console.log("Explorer: https://sepolia.basescan.org/address/" + receipt.contractAddress);
  console.log("=".repeat(50));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
