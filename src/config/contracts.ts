// 合约配置文件 - 统一管理所有合约地址
export const CONTRACT_CONFIG = {
  // 主合约地址
  CIPHER_VOTE_HAVEN: "0xEEe311EC331f10edfca033b233A823612Db1CA03",
  
  // 网络配置
  NETWORK: {
    name: "Sepolia",
    chainId: 11155111,
    rpcUrl: "https://1rpc.io/sepolia"
  },
  
  // 其他合约地址（如果需要）
  // ACL_CONTRACT: "0x687820221192C5B662b25367F70076A37bc79b6c",
  // KMS_CONTRACT: "0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC",
} as const;

// 导出主合约地址作为默认值
export const CONTRACT_ADDRESS = CONTRACT_CONFIG.CIPHER_VOTE_HAVEN;

// 导出网络配置
export const NETWORK_CONFIG = CONTRACT_CONFIG.NETWORK;
