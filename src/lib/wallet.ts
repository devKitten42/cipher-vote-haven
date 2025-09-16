import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';

// Default configuration for development
const projectId = import.meta.env.VITE_NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "2ec9743d0d0cd7fb94dee1a7e6d33475";
const rpcUrl = import.meta.env.VITE_NEXT_PUBLIC_RPC_URL || "https://1rpc.io/sepolia";

export const wagmiConfig = getDefaultConfig({
  appName: 'Cipher Vote Haven',
  projectId: projectId,
  chains: [sepolia],
  ssr: false,
});
