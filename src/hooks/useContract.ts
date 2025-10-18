import { useState, useEffect } from 'react';
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
  resultsRevealed: boolean;
  category: string;
  priority: string;
  tags: string;
  votingOptions: string;
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
    quorumThreshold: number,
    category: string = "governance",
    priority: string = "medium",
    tags: string = "",
    votingOptions: string = "yes_no_abstain"
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
        BigInt(quorumThreshold),
        category,
        priority,
        tags,
        votingOptions
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
    resultsRevealed,
    category,
    priority,
    tags,
    votingOptions
  ] = data as [string, string, boolean, boolean, string, bigint, bigint, bigint, boolean, string, string, string, string];

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
    resultsRevealed,
    category,
    priority,
    tags,
    votingOptions
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
  console.log('🔍 useProposalCount: Fetching proposal count from contract...');
  console.log('📋 Contract address:', CONTRACT_ADDRESS);
  
  const { data, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getProposalCount',
  });

  console.log('📊 Proposal count data:', data);
  console.log('⏳ Loading state:', isLoading);
  console.log('❌ Error state:', error);

  const count = data ? Number(data) : 0;
  console.log('🔢 Final proposal count:', count);

  return {
    count,
    isLoading,
    error,
  };
};

// Hook for loading all proposals from contract - using publicClient like bloom-chain-secure
export const useAllProposals = () => {
  const { count: proposalCount } = useProposalCount();
  const publicClient = usePublicClient();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadAllProposals = async () => {
      console.log('🔍 useAllProposals: Starting to load proposals...');
      console.log('📊 Proposal count from contract:', proposalCount);
      
      if (!proposalCount || proposalCount === 0) {
        console.log('⚠️ No proposals found, setting empty array');
        setProposals([]);
        return;
      }

      if (!publicClient) {
        console.log('⚠️ Public client not available');
        return;
      }

      console.log('🔄 Starting to load proposals from contract...');
      setIsLoading(true);
      setError(null);

      try {
        const loadedProposals: Proposal[] = [];
        
        // 使用publicClient读取合约，就像bloom-chain-secure项目一样
        for (let i = 0; i < proposalCount; i++) {
          console.log(`🔍 Loading proposal ${i} from contract using publicClient...`);
          try {
            const result = await publicClient.readContract({
              address: CONTRACT_ADDRESS as `0x${string}`,
              abi: CONTRACT_ABI,
              functionName: 'getProposalInfo',
              args: [BigInt(i)]
            });

            console.log(`📊 Proposal ${i} data from contract:`, result);
            
            const [
              title,
              description,
              isActive,
              isEnded,
              proposer,
              startTime,
              endTime,
              quorumThreshold,
              resultsRevealed,
              category,
              priority,
              tags,
              votingOptions
            ] = result as [string, string, boolean, boolean, string, bigint, bigint, bigint, boolean, string, string, string, string];

            loadedProposals.push({
              id: i.toString(),
              title,
              description,
              proposer,
              startTime: Number(startTime),
              endTime: Number(endTime),
              quorumThreshold: Number(quorumThreshold),
              isActive,
              isEnded,
              resultsRevealed,
              category,
              priority,
              tags,
              votingOptions,
              yesVotes: 0,
              noVotes: 0,
              abstainVotes: 0,
              totalVotes: 0
            });
            
            console.log(`✅ Proposal ${i} loaded successfully from contract`);
          } catch (err) {
            console.error(`❌ Failed to load proposal ${i}:`, err);
          }
        }
        
        console.log(`📊 Total loaded proposals: ${loadedProposals.length}`);
        setProposals(loadedProposals);
      } catch (err) {
        console.error('❌ Error in loadAllProposals:', err);
        setError(err as Error);
      } finally {
        console.log('🏁 Finished loading proposals');
        setIsLoading(false);
      }
    };

    loadAllProposals();
  }, [proposalCount, publicClient]);

  return {
    proposals,
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
