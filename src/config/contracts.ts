// Contract configuration file - centralized management of all contract addresses
export const CONTRACT_CONFIG = {
  // Main contract address
  CIPHER_VOTE_HAVEN: "0x73b15e203DC18ab1d8d8F34473dC9f95a7CF1083",
  
  // Network configuration
  NETWORK: {
    name: "Sepolia",
    chainId: 11155111,
    rpcUrl: "https://1rpc.io/sepolia"
  },
  
  // Other contract addresses (if needed)
  // ACL_CONTRACT: "0x687820221192C5B662b25367F70076A37bc79b6c",
  // KMS_CONTRACT: "0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC",
} as const;

// Export main contract address as default
export const CONTRACT_ADDRESS = CONTRACT_CONFIG.CIPHER_VOTE_HAVEN;

// Export network configuration
export const NETWORK_CONFIG = CONTRACT_CONFIG.NETWORK;
