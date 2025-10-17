// Contract configuration and ABI
import { CONTRACT_ADDRESS } from '../config/contracts';

export const CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_title",
        "type": "string"
      },
      {
        "internalType": "string", 
        "name": "_description",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_duration",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_quorumThreshold",
        "type": "uint256"
      }
    ],
    "name": "createProposal",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      },
      {
        "internalType": "bytes32",
        "name": "voteChoice",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "inputProof",
        "type": "bytes"
      }
    ],
    "name": "castVote",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      }
    ],
    "name": "getProposalInfo",
    "outputs": [
      {
        "internalType": "string",
        "name": "title",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "description", 
        "type": "string"
      },
      {
        "internalType": "bool",
        "name": "isActive",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "isEnded",
        "type": "bool"
      },
      {
        "internalType": "address",
        "name": "proposer",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "startTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "endTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "quorumThreshold",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "resultsRevealed",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      }
    ],
    "name": "getProposalVoteCounts",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "yesVotesHandle",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "noVotesHandle",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "abstainVotesHandle",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "totalVotesHandle",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "voter",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "isVerified",
        "type": "bool"
      }
    ],
    "name": "registerVoter",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      }
    ],
    "name": "endProposal",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      }
    ],
    "name": "revealResults",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "voter",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      }
    ],
    "name": "hasVoterVotedOnProposal",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getProposalCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Contract interaction utilities
export const contractUtils = {
  async createProposal(
    title: string,
    description: string,
    duration: number,
    quorumThreshold: number
  ) {
    // This would be called via wagmi's useWriteContract hook
    return {
      title,
      description,
      duration,
      quorumThreshold
    };
  },
  
  async castVote(
    proposalId: number,
    voteChoice: number,
    contractAddress: string,
    userAddress: string
  ) {
    const { FHEVoteEncryption } = await import('./fhe-encryption');
    const { handles, inputProof } = await FHEVoteEncryption.encryptVote(voteChoice, contractAddress, userAddress);
    
    return {
      proposalId,
      voteChoice: handles[0],
      inputProof
    };
  }
};
