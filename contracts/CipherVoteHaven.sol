// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
import { euint32, externalEuint32, euint8, ebool, FHE } from "@fhevm/solidity/lib/FHE.sol";

contract CipherVoteHaven is SepoliaConfig {
    using FHE for *;
    
    struct Proposal {
        euint32 proposalId;
        string title;
        string description;
        euint32 yesVotes;
        euint32 noVotes;
        euint32 abstainVotes;
        euint32 totalVotes;
        bool isActive;
        bool isEnded;
        address proposer;
        uint256 startTime;
        uint256 endTime;
        uint256 quorumThreshold;
    }
    
    struct Vote {
        euint32 voteId;
        euint8 voteChoice; // 1 = Yes, 2 = No, 3 = Abstain
        address voter;
        uint256 timestamp;
    }
    
    struct VoterInfo {
        bool hasVoted;
        euint32 reputation;
        bool isVerified;
    }
    
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => Vote) public votes;
    mapping(address => VoterInfo) public voters;
    mapping(address => mapping(uint256 => bool)) public hasVotedOnProposal;
    
    uint256 public proposalCounter;
    uint256 public voteCounter;
    
    address public owner;
    address public verifier;
    
    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string title);
    event VoteCast(uint256 indexed voteId, uint256 indexed proposalId, address indexed voter);
    event ProposalEnded(uint256 indexed proposalId, bool quorumReached);
    event VoterRegistered(address indexed voter, bool isVerified);
    event ReputationUpdated(address indexed voter, uint32 reputation);
    
    constructor(address _verifier) {
        owner = msg.sender;
        verifier = _verifier;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyVerifier() {
        require(msg.sender == verifier, "Only verifier can call this function");
        _;
    }
    
    function createProposal(
        string memory _title,
        string memory _description,
        uint256 _duration,
        uint256 _quorumThreshold
    ) public returns (uint256) {
        require(bytes(_title).length > 0, "Proposal title cannot be empty");
        require(_duration > 0, "Duration must be positive");
        require(_quorumThreshold > 0, "Quorum threshold must be positive");
        
        uint256 proposalId = proposalCounter++;
        
        proposals[proposalId] = Proposal({
            proposalId: FHE.asEuint32(0), // Will be set properly later
            title: _title,
            description: _description,
            yesVotes: FHE.asEuint32(0),
            noVotes: FHE.asEuint32(0),
            abstainVotes: FHE.asEuint32(0),
            totalVotes: FHE.asEuint32(0),
            isActive: true,
            isEnded: false,
            proposer: msg.sender,
            startTime: block.timestamp,
            endTime: block.timestamp + _duration,
            quorumThreshold: _quorumThreshold
        });
        
        emit ProposalCreated(proposalId, msg.sender, _title);
        return proposalId;
    }
    
    function castVote(
        uint256 proposalId,
        externalEuint8 voteChoice,
        bytes calldata inputProof
    ) public returns (uint256) {
        require(proposals[proposalId].proposer != address(0), "Proposal does not exist");
        require(proposals[proposalId].isActive, "Proposal is not active");
        require(block.timestamp <= proposals[proposalId].endTime, "Voting period has ended");
        require(!hasVotedOnProposal[msg.sender][proposalId], "Already voted on this proposal");
        require(voters[msg.sender].isVerified, "Voter not verified");
        
        uint256 voteId = voteCounter++;
        
        // Convert externalEuint8 to euint8 using FHE.fromExternal
        euint8 internalVoteChoice = FHE.fromExternal(voteChoice, inputProof);
        
        votes[voteId] = Vote({
            voteId: FHE.asEuint32(0), // Will be set properly later
            voteChoice: internalVoteChoice,
            voter: msg.sender,
            timestamp: block.timestamp
        });
        
        // Update proposal vote counts based on choice
        euint8 yesChoice = FHE.asEuint8(1);
        euint8 noChoice = FHE.asEuint8(2);
        euint8 abstainChoice = FHE.asEuint8(3);
        
        // Use FHE conditional operations to update vote counts
        ebool isYes = FHE.eq(internalVoteChoice, yesChoice);
        ebool isNo = FHE.eq(internalVoteChoice, noChoice);
        ebool isAbstain = FHE.eq(internalVoteChoice, abstainChoice);
        
        // Update vote counts (this is a simplified version - in practice you'd need more complex FHE operations)
        proposals[proposalId].yesVotes = FHE.add(proposals[proposalId].yesVotes, FHE.select(isYes, FHE.asEuint32(1), FHE.asEuint32(0)));
        proposals[proposalId].noVotes = FHE.add(proposals[proposalId].noVotes, FHE.select(isNo, FHE.asEuint32(1), FHE.asEuint32(0)));
        proposals[proposalId].abstainVotes = FHE.add(proposals[proposalId].abstainVotes, FHE.select(isAbstain, FHE.asEuint32(1), FHE.asEuint32(0)));
        proposals[proposalId].totalVotes = FHE.add(proposals[proposalId].totalVotes, FHE.asEuint32(1));
        
        hasVotedOnProposal[msg.sender][proposalId] = true;
        
        emit VoteCast(voteId, proposalId, msg.sender);
        return voteId;
    }
    
    function endProposal(uint256 proposalId) public {
        require(proposals[proposalId].proposer != address(0), "Proposal does not exist");
        require(proposals[proposalId].isActive, "Proposal is not active");
        require(block.timestamp > proposals[proposalId].endTime, "Voting period not ended");
        
        proposals[proposalId].isActive = false;
        proposals[proposalId].isEnded = true;
        
        // Check if quorum was reached (this would need to be decrypted off-chain)
        bool quorumReached = true; // Placeholder - actual quorum check would be done off-chain
        
        emit ProposalEnded(proposalId, quorumReached);
    }
    
    function registerVoter(address voter, bool isVerified) public onlyVerifier {
        require(voter != address(0), "Invalid voter address");
        
        voters[voter] = VoterInfo({
            hasVoted: false,
            reputation: FHE.asEuint32(100), // Default reputation
            isVerified: isVerified
        });
        
        emit VoterRegistered(voter, isVerified);
    }
    
    function updateVoterReputation(address voter, euint32 reputation) public onlyVerifier {
        require(voters[voter].isVerified, "Voter not registered");
        require(voter != address(0), "Invalid voter address");
        
        voters[voter].reputation = reputation;
        
        emit ReputationUpdated(voter, 0); // FHE.decrypt(reputation) - will be decrypted off-chain
    }
    
    function getProposalInfo(uint256 proposalId) public view returns (
        string memory title,
        string memory description,
        uint8 yesVotes,
        uint8 noVotes,
        uint8 abstainVotes,
        uint8 totalVotes,
        bool isActive,
        bool isEnded,
        address proposer,
        uint256 startTime,
        uint256 endTime,
        uint256 quorumThreshold
    ) {
        Proposal storage proposal = proposals[proposalId];
        return (
            proposal.title,
            proposal.description,
            0, // FHE.decrypt(proposal.yesVotes) - will be decrypted off-chain
            0, // FHE.decrypt(proposal.noVotes) - will be decrypted off-chain
            0, // FHE.decrypt(proposal.abstainVotes) - will be decrypted off-chain
            0, // FHE.decrypt(proposal.totalVotes) - will be decrypted off-chain
            proposal.isActive,
            proposal.isEnded,
            proposal.proposer,
            proposal.startTime,
            proposal.endTime,
            proposal.quorumThreshold
        );
    }
    
    function getVoteInfo(uint256 voteId) public view returns (
        uint8 voteChoice,
        address voter,
        uint256 timestamp
    ) {
        Vote storage vote = votes[voteId];
        return (
            0, // FHE.decrypt(vote.voteChoice) - will be decrypted off-chain
            vote.voter,
            vote.timestamp
        );
    }
    
    function getVoterInfo(address voter) public view returns (
        bool hasVoted,
        uint8 reputation,
        bool isVerified
    ) {
        VoterInfo storage voterInfo = voters[voter];
        return (
            voterInfo.hasVoted,
            0, // FHE.decrypt(voterInfo.reputation) - will be decrypted off-chain
            voterInfo.isVerified
        );
    }
    
    function hasVoterVotedOnProposal(address voter, uint256 proposalId) public view returns (bool) {
        return hasVotedOnProposal[voter][proposalId];
    }
    
    function getProposalCount() public view returns (uint256) {
        return proposalCounter;
    }
    
    function getVoteCount() public view returns (uint256) {
        return voteCounter;
    }
}
