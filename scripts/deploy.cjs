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
  
  // Initialize demo proposals
  console.log("Creating demo proposals...");
  
  const demoProposals = [
    {
      title: "Increase Development Fund Allocation",
      description: "Proposal to allocate an additional 500,000 tokens to the development fund for Q2 2024 roadmap execution and ecosystem growth initiatives.",
      duration: 7 * 24 * 60 * 60, // 7 days in seconds
      quorumThreshold: 100
    },
    {
      title: "Implement Quarterly Governance Reviews", 
      description: "Establish regular governance review sessions to assess DAO performance, member engagement, and process improvements.",
      duration: 10 * 24 * 60 * 60, // 10 days in seconds
      quorumThreshold: 150
    },
    {
      title: "Update Treasury Management Strategy",
      description: "Modernize treasury allocation strategy to include DeFi yield farming and risk diversification across multiple protocols.",
      duration: 5 * 24 * 60 * 60, // 5 days in seconds
      quorumThreshold: 200
    },
    {
      title: "Community Staking Rewards Program",
      description: "Launch a new staking rewards program with 15% APY for community members who stake their tokens for 6+ months.",
      duration: 14 * 24 * 60 * 60, // 14 days in seconds
      quorumThreshold: 300
    },
    {
      title: "Partnership with Major DeFi Protocol",
      description: "Form strategic partnership with leading DeFi protocol to integrate cross-chain functionality and increase TVL.",
      duration: 21 * 24 * 60 * 60, // 21 days in seconds
      quorumThreshold: 500
    },
    {
      title: "Technical Upgrade: Layer 2 Integration",
      description: "Implement Layer 2 scaling solution to reduce transaction costs and improve user experience for all governance operations.",
      duration: 30 * 24 * 60 * 60, // 30 days in seconds
      quorumThreshold: 750
    },
    {
      title: "Environmental Sustainability Initiative",
      description: "Allocate 2% of treasury funds to carbon offset programs and renewable energy investments to support environmental sustainability.",
      duration: 12 * 24 * 60 * 60, // 12 days in seconds
      quorumThreshold: 250
    },
    {
      title: "Emergency Response Fund",
      description: "Create emergency response fund with 1M tokens to handle unexpected market conditions and provide community support during crises.",
      duration: 3 * 24 * 60 * 60, // 3 days in seconds
      quorumThreshold: 1000
    }
  ];
  
  // Create demo proposals
  for (let i = 0; i < demoProposals.length; i++) {
    const proposal = demoProposals[i];
    try {
      console.log(`Creating proposal ${i + 1}: ${proposal.title}`);
      const createTx = await cipherVoteHaven.createProposal(
        proposal.title,
        proposal.description,
        proposal.duration,
        proposal.quorumThreshold
      );
      await createTx.wait();
      console.log(`✅ Proposal ${i + 1} created successfully`);
    } catch (error) {
      console.log(`⚠️  Failed to create proposal ${i + 1}:`, error.message);
    }
  }
  
  // Update contract address in frontend files
  console.log("📝 Updating contract address in frontend...");
  
  const fs = require('fs');
  const path = require('path');
  
  // Update contract address in contract.ts
  const contractTsPath = path.join(__dirname, "../src/config/contracts.ts");
  let contractTsContent = fs.readFileSync(contractTsPath, "utf8");
  contractTsContent = contractTsContent.replace(
    /CIPHER_VOTE_HAVEN: "0x[^"]*"/,
    `CIPHER_VOTE_HAVEN: "${contractAddress}"`
  );
  fs.writeFileSync(contractTsPath, contractTsContent);
  
  // Update contract address in lib/contract.ts
  const libContractTsPath = path.join(__dirname, "../src/lib/contract.ts");
  let libContractTsContent = fs.readFileSync(libContractTsPath, "utf8");
  libContractTsContent = libContractTsContent.replace(
    /CONTRACT_ADDRESS = "0x[^"]*"/,
    `CONTRACT_ADDRESS = "${contractAddress}"`
  );
  fs.writeFileSync(libContractTsPath, libContractTsContent);
  
  console.log("✅ Contract address updated in frontend files");
  
  console.log("🎉 Deployment completed successfully!");
  console.log("\n📋 Deployment Summary:");
  console.log(`📍 Contract Address: ${contractAddress}`);
  console.log(`🔗 Explorer: https://sepolia.etherscan.io/address/${contractAddress}`);
  console.log(`👤 Deployer: ${deployer.address}`);
  console.log(`📊 Demo Proposals Created: ${demoProposals.length}`);
  console.log("\n🚀 Next Steps:");
  console.log("1. Contract address has been automatically updated in frontend");
  console.log("2. Test the FHE encryption/decryption functionality");
  console.log("3. Create and cast encrypted votes");
  console.log("4. Test result decryption after voting ends");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
