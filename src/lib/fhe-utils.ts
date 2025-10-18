// FHE utility functions for Cipher Vote Haven
// This file contains helper functions for FHE operations

export const FHE_CONSTANTS = {
  MAX_UINT32: 4294967295,
  MAX_UINT8: 255,
  MAX_UINT64: 18446744073709551615n,
} as const;

export function validateFHEInput(value: number, type: 'uint8' | 'uint32' | 'uint64'): boolean {
  switch (type) {
    case 'uint8':
      return value >= 0 && value <= FHE_CONSTANTS.MAX_UINT8;
    case 'uint32':
      return value >= 0 && value <= FHE_CONSTANTS.MAX_UINT32;
    case 'uint64':
      return value >= 0 && value <= Number(FHE_CONSTANTS.MAX_UINT64);
    default:
      return false;
  }
}

export function formatFHEError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Unknown FHE error occurred';
}

// Convert FHE handle to proper hex format (32 bytes)
export function convertHex(handle: any): string {
  let hex = '';
  
  try {
    if (handle instanceof Uint8Array) {
      hex = `0x${Array.from(handle).map(b => b.toString(16).padStart(2, '0')).join('')}`;
    } else if (typeof handle === 'string') {
      hex = handle.startsWith('0x') ? handle : `0x${handle}`;
    } else if (Array.isArray(handle)) {
      hex = `0x${handle.map(b => b.toString(16).padStart(2, '0')).join('')}`;
    } else if (handle && typeof handle === 'object' && handle.data) {
      // Handle FHE SDK object format
      hex = `0x${Array.from(handle.data).map(b => b.toString(16).padStart(2, '0')).join('')}`;
    } else {
      hex = `0x${handle.toString()}`;
    }
    
    // Ensure exactly 32 bytes (66 characters including 0x)
    if (hex.length < 66) {
      hex = hex.padEnd(66, '0');
    } else if (hex.length > 66) {
      hex = hex.substring(0, 66);
    }
    
    console.log('🔧 Converted hex:', hex.substring(0, 10) + '...', 'Length:', hex.length);
    return hex;
  } catch (error) {
    console.error('❌ Error converting hex:', error);
    console.log('📊 Handle type:', typeof handle);
    console.log('📊 Handle value:', handle);
    throw new Error(`Failed to convert handle to hex: ${error.message}`);
  }
}

// FHE encryption helper for vote operations
export async function encryptVoteData(
  instance: any,
  contractAddress: string,
  userAddress: string,
  data: {
    voteChoice?: number; // 1: Yes, 2: No, 3: Abstain
    reputation?: number;
  }
) {
  try {
    console.log('🚀 Starting FHE vote data encryption process...');
    console.log('📊 Input data:', {
      contractAddress,
      userAddress,
      data
    });
    
    console.log('🔄 Step 1: Creating encrypted input...');
    const input = instance.createEncryptedInput(contractAddress, userAddress);
    console.log('✅ Step 1 completed: Encrypted input created');
    
    console.log('🔄 Step 2: Adding encrypted data...');
    
    // Validate all values are within 8-bit range for vote choice
    const max8Bit = 255; // 2^8 - 1
    
    if (data.voteChoice !== undefined) {
      console.log('📊 Adding vote choice:', data.voteChoice);
      if (data.voteChoice > max8Bit) {
        throw new Error(`Vote choice ${data.voteChoice} exceeds 8-bit limit`);
      }
      input.add8(data.voteChoice);
    }
    
    if (data.reputation !== undefined) {
      console.log('📊 Adding reputation:', data.reputation);
      if (data.reputation > max8Bit) {
        throw new Error(`Reputation ${data.reputation} exceeds 8-bit limit`);
      }
      input.add8(data.reputation);
    }
    
    console.log('✅ Step 2 completed: All data added to encrypted input');
    
    console.log('🔄 Step 3: Encrypting data...');
    const encryptedInput = await input.encrypt();
    console.log('✅ Step 3 completed: Data encrypted successfully');
    console.log('📊 Encrypted handles count:', encryptedInput.handles.length);
    
    console.log('🔄 Step 4: Converting handles to hex format...');
    const handles = encryptedInput.handles.map((handle, index) => {
      const hex = convertHex(handle);
      console.log(`📊 Handle ${index}: ${hex.substring(0, 10)}... (${hex.length} chars)`);
      return hex;
    });
    
    const proof = `0x${Array.from(encryptedInput.inputProof)
      .map((b: number) => b.toString(16).padStart(2, '0')).join('')}`;
    console.log('📊 Proof length:', proof.length);
    
    console.log('🎉 Vote data encryption completed successfully!');
    console.log('📊 Final result:', {
      handlesCount: handles.length,
      proofLength: proof.length,
      handles: handles.map(h => h.substring(0, 10) + '...')
    });
    
    return {
      handles,
      inputProof: proof
    };
  } catch (error) {
    console.error('❌ FHE vote data encryption failed:', error);
    console.error('📊 Error details:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      contractAddress,
      userAddress,
      data
    });
    throw error;
  }
}

// FHE decryption helper for vote data
export async function decryptVoteData(
  instance: any,
  encryptedData: any[],
  contractAddress: string,
  userAddress: string,
  signer: any
) {
  try {
    console.log('🚀 Starting FHE vote data decryption process...');
    console.log('📊 Input parameters:', {
      encryptedDataLength: encryptedData.length,
      contractAddress,
      userAddress
    });
    
    // Check if FHE instance has proper keypair
    if (!instance || typeof instance.userDecrypt !== 'function') {
      throw new Error('FHE instance not properly initialized');
    }
    
    // Validate encrypted data format
    if (!encryptedData || encryptedData.length === 0) {
      throw new Error('No encrypted data provided');
    }
    
    console.log('🔄 Step 1: Generating keypair...');
    const keypair = instance.generateKeypair();
    console.log('✅ Step 1 completed: Keypair generated');
    
    console.log('🔄 Step 2: Building handle-contract pairs...');
    const handleContractPairs = encryptedData.map((handle, index) => {
      const hex = convertHex(handle);
      console.log(`📊 Handle ${index}: ${hex.substring(0, 10)}... (${hex.length} chars)`);
      return {
        handle: hex,
        contractAddress
      };
    });
    console.log('✅ Step 2 completed: Handle-contract pairs built');
    console.log('📊 Pairs count:', handleContractPairs.length);
    
    console.log('🔄 Step 3: Creating EIP712 signature...');
    const startTimeStamp = Math.floor(Date.now() / 1000).toString();
    const durationDays = '10';
    const contractAddresses = [contractAddress];
    
    const eip712 = instance.createEIP712(
      keypair.publicKey,
      contractAddresses,
      startTimeStamp,
      durationDays
    );
    
    const signature = await signer.signTypedData(
      eip712.domain,
      {
        UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification,
      },
      eip712.message,
    );
    console.log('✅ Step 3 completed: EIP712 signature created');
    
    console.log('🔄 Step 4: Decrypting handles...');
    const result = await instance.userDecrypt(
      handleContractPairs,
      keypair.privateKey,
      keypair.publicKey,
      signature.replace('0x', ''),
      contractAddresses,
      userAddress,
      startTimeStamp,
      durationDays
    );
    console.log('✅ Step 4 completed: Handles decrypted');
    console.log('📊 Decryption result keys:', Object.keys(result || {}));
    
    console.log('🔄 Step 5: Parsing decrypted data...');
    const decryptedData = {
      voteChoice: result[handleContractPairs[0]?.handle]?.toString() || '0',
      reputation: result[handleContractPairs[1]?.handle]?.toString() || '0'
    };
    console.log('✅ Step 5 completed: Data parsed successfully');
    console.log('📊 Decrypted data:', decryptedData);
    
    console.log('🎉 Vote data decryption completed successfully!');
    return result;
  } catch (error) {
    console.error('❌ FHE vote data decryption failed:', error);
    console.error('📊 Error details:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      encryptedDataLength: encryptedData.length,
      contractAddress,
      userAddress
    });
    
    // Provide specific error guidance
    if (error?.message?.includes('Invalid public or private key')) {
      console.log('💡 Suggestion: This data may have been encrypted with a different keypair. Try refreshing the page.');
      throw new Error('Data encrypted with different keypair. Please refresh the page and try again.');
    } else if (error?.message?.includes('Cannot read properties of undefined')) {
      console.log('💡 Suggestion: FHE SDK internal error. Please refresh the page.');
      throw new Error('FHE SDK error. Please refresh the page and try again.');
    }
    
    throw error;
  }
}

// Test FHE functionality
export async function testFHEFunctionality(instance: any) {
  try {
    console.log('🧪 Testing FHE functionality...');
    
    const testData = {
      voteChoice: 1,
      reputation: 100
    };
    
    // Test encryption
    const encrypted = await encryptVoteData(
      instance,
      '0x0000000000000000000000000000000000000000', // Test address
      '0x0000000000000000000000000000000000000000', // Test user
      testData
    );
    
    console.log('✅ FHE Test Successful! Encrypted', encrypted.handles.length, 'handles');
    return true;
  } catch (error) {
    console.error('❌ FHE Test Failed:', error);
    return false;
  }
}
