const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying CipherVoteHaven contract...");

  // Get the contract factory
  const CipherVoteHaven = await ethers.getContractFactory("CipherVoteHaven");

  // Deploy the contract with a verifier address (use deployer as verifier for now)
  const [deployer] = await ethers.getSigners();
  const verifierAddress = deployer.address; // Use deployer as verifier for simplicity
  
  console.log("Deploying with verifier:", verifierAddress);
  
  const cipherVoteHaven = await CipherVoteHaven.deploy(verifierAddress);

  // Wait for deployment to complete
  await cipherVoteHaven.waitForDeployment();

  const contractAddress = await cipherVoteHaven.getAddress();
  
  console.log("CipherVoteHaven deployed to:", contractAddress);
  console.log("Contract address:", contractAddress);
  
  // Verify the deployment
  console.log("Verifying deployment...");
  const owner = await cipherVoteHaven.owner();
  const verifier = await cipherVoteHaven.verifier();
  console.log("Contract owner:", owner);
  console.log("Contract verifier:", verifier);
  
  // Test basic functionality
  console.log("Testing basic functionality...");
  const proposalCount = await cipherVoteHaven.getProposalCount();
  console.log("Initial proposal count:", proposalCount.toString());
  
  // Register the deployer as a voter
  console.log("Registering deployer as voter...");
  const registerTx = await cipherVoteHaven.registerVoter(deployer.address, true);
  await registerTx.wait();
  console.log("Deployer registered as voter");
  
  console.log("Deployment completed successfully!");
  console.log("\nNext steps:");
  console.log("1. Update CONTRACT_ADDRESS in src/lib/contract.ts");
  console.log("2. Update VITE_NEXT_PUBLIC_CONTRACT_ADDRESS in .env.local");
  console.log("3. Verify the contract on Etherscan (if on mainnet/testnet)");
  console.log("4. Test the contract functions");
  console.log("5. Test FHE encryption/decryption functionality");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
