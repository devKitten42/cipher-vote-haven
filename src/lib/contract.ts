// Contract configuration and ABI
export const CONTRACT_ADDRESS = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8bC"; // Placeholder address - replace with deployed contract address

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
        "internalType": "bytes",
        "name": "encryptedVote",
        "type": "bytes"
      },
      {
        "internalType": "bytes",
        "name": "proof",
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
        "internalType": "uint8",
        "name": "yesVotes",
        "type": "uint8"
      },
      {
        "internalType": "uint8",
        "name": "noVotes",
        "type": "uint8"
      },
      {
        "internalType": "uint8",
        "name": "abstainVotes",
        "type": "uint8"
      },
      {
        "internalType": "uint8",
        "name": "totalVotes",
        "type": "uint8"
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

// FHE encryption utilities (simplified for demo)
export class FHEEncryption {
  // In a real implementation, this would use actual FHE libraries
  static async encryptVote(voteChoice: number): Promise<{ encrypted: string; proof: string }> {
    // Simulate FHE encryption
    const encrypted = btoa(JSON.stringify({
      vote: voteChoice,
      timestamp: Date.now(),
      nonce: Math.random().toString(36)
    }));
    
    // Simulate zero-knowledge proof
    const proof = btoa(JSON.stringify({
      commitment: encrypted,
      proof: "zk-proof-data",
      publicKey: "fhe-public-key"
    }));
    
    return { encrypted, proof };
  }
  
  static async decryptVote(encrypted: string): Promise<number> {
    try {
      const data = JSON.parse(atob(encrypted));
      return data.vote;
    } catch {
      return 0;
    }
  }
}

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
    voteChoice: number
  ) {
    const { encrypted, proof } = await FHEEncryption.encryptVote(voteChoice);
    
    return {
      proposalId,
      encryptedVote: encrypted,
      proof
    };
  }
};
