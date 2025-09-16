const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CipherVoteHaven", function () {
  let cipherVoteHaven;
  let owner;
  let voter1;
  let voter2;
  let voter3;

  beforeEach(async function () {
    [owner, voter1, voter2, voter3] = await ethers.getSigners();
    
    const CipherVoteHaven = await ethers.getContractFactory("CipherVoteHaven");
    cipherVoteHaven = await CipherVoteHaven.deploy();
    await cipherVoteHaven.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await cipherVoteHaven.owner()).to.equal(owner.address);
    });

    it("Should initialize with zero proposals", async function () {
      expect(await cipherVoteHaven.getProposalCount()).to.equal(0);
    });
  });

  describe("Voter Registration", function () {
    it("Should allow owner to register voters", async function () {
      await cipherVoteHaven.registerVoter(voter1.address);
      const voter = await cipherVoteHaven.voters(voter1.address);
      expect(voter.isVerified).to.be.true;
    });

    it("Should not allow non-owner to register voters", async function () {
      await expect(
        cipherVoteHaven.connect(voter1).registerVoter(voter2.address)
      ).to.be.revertedWith("Only owner can register voters");
    });
  });

  describe("Proposal Creation", function () {
    beforeEach(async function () {
      await cipherVoteHaven.registerVoter(voter1.address);
    });

    it("Should create a proposal successfully", async function () {
      const title = "Test Proposal";
      const description = "This is a test proposal";
      const duration = 7 * 24 * 60 * 60; // 7 days in seconds
      const quorumThreshold = 100;

      const tx = await cipherVoteHaven
        .connect(voter1)
        .createProposal(title, description, duration, quorumThreshold);
      
      await tx.wait();

      const proposalCount = await cipherVoteHaven.getProposalCount();
      expect(proposalCount).to.equal(1);

      const proposal = await cipherVoteHaven.getProposalInfo(0);
      expect(proposal.title).to.equal(title);
      expect(proposal.description).to.equal(description);
      expect(proposal.isActive).to.be.true;
      expect(proposal.proposer).to.equal(voter1.address);
    });

    it("Should not allow unregistered voters to create proposals", async function () {
      await expect(
        cipherVoteHaven
          .connect(voter2)
          .createProposal("Test", "Description", 86400, 100)
      ).to.be.revertedWith("Voter not verified");
    });
  });

  describe("Voting", function () {
    let proposalId;

    beforeEach(async function () {
      await cipherVoteHaven.registerVoter(voter1.address);
      await cipherVoteHaven.registerVoter(voter2.address);
      await cipherVoteHaven.registerVoter(voter3.address);

      const tx = await cipherVoteHaven
        .connect(voter1)
        .createProposal("Test Proposal", "Description", 86400, 100);
      
      await tx.wait();
      proposalId = 0;
    });

    it("Should allow registered voters to cast votes", async function () {
      // Mock encrypted vote data
      const encryptedVote = ethers.utils.formatBytes32String("encrypted_vote_1");
      const proof = ethers.utils.formatBytes32String("proof_data");

      const tx = await cipherVoteHaven
        .connect(voter2)
        .castVote(proposalId, encryptedVote, proof);
      
      await tx.wait();

      const hasVoted = await cipherVoteHaven.hasVoterVotedOnProposal(voter2.address, proposalId);
      expect(hasVoted).to.be.true;
    });

    it("Should not allow unregistered voters to vote", async function () {
      const encryptedVote = ethers.utils.formatBytes32String("encrypted_vote_1");
      const proof = ethers.utils.formatBytes32String("proof_data");

      await expect(
        cipherVoteHaven
          .connect(voter3)
          .castVote(proposalId, encryptedVote, proof)
      ).to.be.revertedWith("Voter not verified");
    });

    it("Should not allow double voting", async function () {
      const encryptedVote = ethers.utils.formatBytes32String("encrypted_vote_1");
      const proof = ethers.utils.formatBytes32String("proof_data");

      await cipherVoteHaven
        .connect(voter2)
        .castVote(proposalId, encryptedVote, proof);

      await expect(
        cipherVoteHaven
          .connect(voter2)
          .castVote(proposalId, encryptedVote, proof)
      ).to.be.revertedWith("Already voted on this proposal");
    });
  });

  describe("Proposal Management", function () {
    let proposalId;

    beforeEach(async function () {
      await cipherVoteHaven.registerVoter(voter1.address);
      
      const tx = await cipherVoteHaven
        .connect(voter1)
        .createProposal("Test Proposal", "Description", 86400, 100);
      
      await tx.wait();
      proposalId = 0;
    });

    it("Should allow proposer to end proposal", async function () {
      // Fast forward time to after voting period
      await ethers.provider.send("evm_increaseTime", [86401]);
      await ethers.provider.send("evm_mine");

      const tx = await cipherVoteHaven
        .connect(voter1)
        .endProposal(proposalId);
      
      await tx.wait();

      const proposal = await cipherVoteHaven.getProposalInfo(proposalId);
      expect(proposal.isActive).to.be.false;
      expect(proposal.isEnded).to.be.true;
    });

    it("Should not allow ending proposal before voting period ends", async function () {
      await expect(
        cipherVoteHaven.connect(voter1).endProposal(proposalId)
      ).to.be.revertedWith("Voting period has not ended");
    });
  });
});
