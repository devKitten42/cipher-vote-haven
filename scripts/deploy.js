const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying CipherVoteHaven contract...");

  // Get the contract factory
  const CipherVoteHaven = await ethers.getContractFactory("CipherVoteHaven");

  // Deploy the contract
  const cipherVoteHaven = await CipherVoteHaven.deploy();

  // Wait for deployment to complete
  await cipherVoteHaven.waitForDeployment();

  const contractAddress = await cipherVoteHaven.getAddress();
  
  console.log("CipherVoteHaven deployed to:", contractAddress);
  console.log("Contract address:", contractAddress);
  
  // Verify the deployment
  console.log("Verifying deployment...");
  const owner = await cipherVoteHaven.owner();
  console.log("Contract owner:", owner);
  
  // Test basic functionality
  console.log("Testing basic functionality...");
  const proposalCount = await cipherVoteHaven.getProposalCount();
  console.log("Initial proposal count:", proposalCount.toString());
  
  console.log("Deployment completed successfully!");
  console.log("\nNext steps:");
  console.log("1. Update CONTRACT_ADDRESS in src/lib/contract.ts");
  console.log("2. Verify the contract on Etherscan (if on mainnet/testnet)");
  console.log("3. Test the contract functions");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
