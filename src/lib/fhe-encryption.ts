// FHE Encryption utilities for private voting
import { createInstance, initSDK, SepoliaConfig } from '@zama-fhe/relayer-sdk/bundle';

export interface EncryptedVote {
  handles: string[];
  inputProof: string;
}

export interface VoteProof {
  commitment: string;
  proof: string;
  publicKey: string;
  timestamp: number;
}

export class FHEVoteEncryption {
  private static instance: any = null;
  
  /**
   * Initialize FHE SDK
   */
  static async initialize(): Promise<void> {
    try {
      await initSDK();
      this.instance = await createInstance(SepoliaConfig);
    } catch (error) {
      console.error('FHE initialization failed:', error);
      throw error;
    }
  }
  
  /**
   * Get FHE instance
   */
  static getInstance(): any {
    if (!this.instance) {
      throw new Error('FHE not initialized. Call initialize() first.');
    }
    return this.instance;
  }
  
  /**
   * Encrypt a vote choice using real FHE
   */
  static async encryptVote(voteChoice: number, contractAddress: string, userAddress: string): Promise<EncryptedVote> {
    // Validate vote choice
    if (voteChoice < 1 || voteChoice > 3) {
      throw new Error('Invalid vote choice. Must be 1 (Yes), 2 (No), or 3 (Abstain)');
    }
    
    if (!this.instance) {
      await this.initialize();
    }
    
    try {
      // Create encrypted input using FHE instance
      const input = this.instance.createEncryptedInput(contractAddress, userAddress);
      input.add8(voteChoice);
      
      const encryptedInput = await input.encrypt();
      
      return {
        handles: encryptedInput.handles,
        inputProof: `0x${Array.from(encryptedInput.inputProof)
          .map(b => b.toString(16).padStart(2, '0')).join('')}`
      };
    } catch (error) {
      console.error('FHE encryption failed:', error);
      throw error;
    }
  }
  
  /**
   * Decrypt vote counts for result revelation
   */
  static async decryptVoteCounts(
    proposalId: number,
    contractAddress: string,
    userAddress: string,
    signer: any
  ): Promise<{ yesVotes: number; noVotes: number; abstainVotes: number; totalVotes: number }> {
    if (!this.instance) {
      await this.initialize();
    }
    
    try {
      // Get encrypted vote counts from contract
      const contract = new (await import('ethers')).Contract(contractAddress, [], signer);
      const [yesVotesHandle, noVotesHandle, abstainVotesHandle, totalVotesHandle] = 
        await contract.getProposalVoteCounts(proposalId);
      
      // Create handle pairs for decryption
      const handlePairs = [
        { handle: yesVotesHandle, contractAddress },
        { handle: noVotesHandle, contractAddress },
        { handle: abstainVotesHandle, contractAddress },
        { handle: totalVotesHandle, contractAddress }
      ];
      
      // Generate keypair for decryption
      const keypair = this.instance.generateKeypair();
      
      // Create EIP712 signature for decryption
      const start = Math.floor(Date.now() / 1000).toString();
      const days = '10';
      const eip712 = this.instance.createEIP712(keypair.publicKey, [contractAddress], start, days);
      
      const signature = await signer.signTypedData(
        eip712.domain,
        { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
        eip712.message
      );
      
      // Decrypt the vote counts
      const result = await this.instance.userDecrypt(
        handlePairs,
        keypair.privateKey,
        keypair.publicKey,
        signature.replace('0x', ''),
        [contractAddress],
        userAddress,
        start,
        days
      );
      
      return {
        yesVotes: parseInt(result[yesVotesHandle] || '0', 10),
        noVotes: parseInt(result[noVotesHandle] || '0', 10),
        abstainVotes: parseInt(result[abstainVotesHandle] || '0', 10),
        totalVotes: parseInt(result[totalVotesHandle] || '0', 10)
      };
    } catch (error) {
      console.error('FHE decryption failed:', error);
      throw error;
    }
  }
  
  /**
   * Convert FHE handle to proper format
   */
  static convertHex(handle: any): string {
    if (typeof handle === 'string') {
      return handle.startsWith('0x') ? handle : `0x${handle}`;
    } else if (handle instanceof Uint8Array) {
      return `0x${Array.from(handle).map(b => b.toString(16).padStart(2, '0')).join('')}`;
    } else if (Array.isArray(handle)) {
      return `0x${handle.map(b => b.toString(16).padStart(2, '0')).join('')}`;
    }
    return `0x${handle.toString()}`;
  }
}
