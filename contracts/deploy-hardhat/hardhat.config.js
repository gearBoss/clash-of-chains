import "@nomicfoundation/hardhat-ethers";

export default {
  solidity: "0.8.24",
  networks: {
    baseSepolia: {
      type: "http",
      url: "https://sepolia.base.org",
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      chainId: 84532,
    },
  },
};
