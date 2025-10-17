import { useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useZamaInstance } from './useZamaInstance';
import { useEthersSigner } from './useEthersSigner';
import { encryptVoteData, decryptVoteData } from '../lib/fhe-utils';
import { CONTRACT_ADDRESS } from '../config/contracts';
import { CONTRACT_ABI } from '../lib/contract';

export interface Proposal {
  id: string;
  title: string;
  description: string;
  yesVotes: number;
  noVotes: number;
  abstainVotes: number;
  totalVotes: number;
  isActive: boolean;
  isEnded: boolean;
  proposer: string;
  startTime: number;
  endTime: number;
  quorumThreshold: number;
}

export const useContract = () => {
  const { address, isConnected } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });
  const { instance } = useZamaInstance();
  const signerPromise = useEthersSigner();

  // Create a new proposal
  const createProposal = async (
    title: string,
    description: string,
    duration: number,
    quorumThreshold: number
  ) => {
    if (!isConnected) throw new Error('Wallet not connected');
    
    const durationInSeconds = duration * 24 * 60 * 60;
    
    return writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'createProposal',
      args: [
        title,
        description,
        BigInt(durationInSeconds),
        BigInt(quorumThreshold)
      ],
    });
  };

  // Cast a vote with FHE encryption
  const castVote = async (proposalId: number, voteChoice: number) => {
    if (!isConnected || !address) throw new Error('Wallet not connected');
    if (!instance) throw new Error('FHE instance not ready');
    
    try {
      // Encrypt the vote using FHE
      const { handles, inputProof } = await encryptVoteData(
        instance,
        CONTRACT_ADDRESS,
        address,
        { voteChoice }
      );
      
      return writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'castVote',
        args: [
          BigInt(proposalId),
          handles[0] as `0x${string}`,
          inputProof as `0x${string}`
        ],
      });
    } catch (error) {
      console.error('FHE encryption failed:', error);
      throw new Error('Failed to encrypt vote. Please try again.');
    }
  };

  // Register a voter
  const registerVoter = async (voterAddress: string) => {
    if (!isConnected) throw new Error('Wallet not connected');
    
    return writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'registerVoter',
      args: [voterAddress as `0x${string}`],
    });
  };

  // End a proposal
  const endProposal = async (proposalId: number) => {
    if (!isConnected) throw new Error('Wallet not connected');
    
    return writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'endProposal',
      args: [BigInt(proposalId)],
    });
  };

  return {
    // Contract interaction functions
    createProposal,
    castVote,
    registerVoter,
    endProposal,
    
    // Transaction state
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    
    // Account state
    address,
    isConnected,
  };
};

// Hook for reading proposal data
export const useProposal = (proposalId: number) => {
  const { data, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getProposalInfo',
    args: [BigInt(proposalId)],
  });

  if (!data) {
    return {
      proposal: null,
      isLoading,
      error,
    };
  }

  const [
    title,
    description,
    isActive,
    isEnded,
    proposer,
    startTime,
    endTime,
    quorumThreshold,
    resultsRevealed
  ] = data as [string, string, boolean, boolean, string, bigint, bigint, bigint, boolean];

  const proposal: Proposal = {
    id: proposalId.toString(),
    title,
    description,
    yesVotes: 0, // Will be decrypted separately
    noVotes: 0, // Will be decrypted separately
    abstainVotes: 0, // Will be decrypted separately
    totalVotes: 0, // Will be decrypted separately
    isActive,
    isEnded,
    proposer,
    startTime: Number(startTime),
    endTime: Number(endTime),
    quorumThreshold: Number(quorumThreshold),
  };

  return {
    proposal,
    isLoading,
    error,
  };
};

// Hook for checking if user has voted
export const useHasVoted = (proposalId: number) => {
  const { address } = useAccount();
  
  const { data, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'hasVoterVotedOnProposal',
    args: [address as `0x${string}`, BigInt(proposalId)],
    query: {
      enabled: !!address,
    },
  });

  return {
    hasVoted: data as boolean | undefined,
    isLoading,
    error,
  };
};

// Hook for getting proposal count
export const useProposalCount = () => {
  const { data, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getProposalCount',
  });

  return {
    count: data ? Number(data) : 0,
    isLoading,
    error,
  };
};

// Hook for decrypting vote counts
export const useDecryptVoteCounts = (proposalId: number) => {
  const { address } = useAccount();
  const [voteCounts, setVoteCounts] = useState<{
    yesVotes: number;
    noVotes: number;
    abstainVotes: number;
    totalVotes: number;
  } | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const decryptVoteCounts = async (instance: any, signer: any) => {
    if (!address) return;
    
    setIsDecrypting(true);
    setError(null);
    
    try {
      const counts = await decryptVoteData(
        instance,
        [proposalId], // This would need to be the actual encrypted handles
        CONTRACT_ADDRESS,
        address,
        signer
      );
      setVoteCounts(counts);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsDecrypting(false);
    }
  };

  return {
    voteCounts,
    isDecrypting,
    error,
    decryptVoteCounts,
  };
};


// Hook for revealing results
export const useRevealResults = () => {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const revealResults = async (proposalId: number) => {
    return writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: 'revealResults',
      args: [BigInt(proposalId)],
    });
  };

  return {
    revealResults,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
};
