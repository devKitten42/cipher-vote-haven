// Environment configuration
export const config = {
  chainId: 11155111, // Sepolia testnet
  rpcUrl: import.meta.env.VITE_NEXT_PUBLIC_RPC_URL || "https://1rpc.io/sepolia",
  walletConnectProjectId: import.meta.env.VITE_NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "2ec9743d0d0cd7fb94dee1a7e6d33475",
  infuraApiKey: import.meta.env.VITE_NEXT_PUBLIC_INFURA_API_KEY || "",
  alternativeRpcUrl: "https://1rpc.io/sepolia",
} as const;
