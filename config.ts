// Environment configuration
export const config = {
  chainId: 11155111, // Sepolia testnet
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || "https://1rpc.io/sepolia",
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "",
  infuraApiKey: process.env.NEXT_PUBLIC_INFURA_API_KEY || "",
  alternativeRpcUrl: "https://1rpc.io/sepolia",
} as const;
