import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';
import { FHEVoteEncryption } from '@/lib/fhe-encryption';

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
    if (!isConnected) throw new Error('Wallet not connected');
    
    // Encrypt the vote using FHE
    const { encryptedBytes, proofBytes } = await FHEVoteEncryption.encryptVoteToBytes(voteChoice);
    
    return writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'castVote',
      args: [
        BigInt(proposalId),
        encryptedBytes,
        proofBytes
      ],
    });
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
    yesVotes,
    noVotes,
    abstainVotes,
    totalVotes,
    isActive,
    isEnded,
    proposer,
    startTime,
    endTime,
    quorumThreshold
  ] = data as [string, string, number, number, number, number, boolean, boolean, string, bigint, bigint, bigint];

  const proposal: Proposal = {
    id: proposalId.toString(),
    title,
    description,
    yesVotes,
    noVotes,
    abstainVotes,
    totalVotes,
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
