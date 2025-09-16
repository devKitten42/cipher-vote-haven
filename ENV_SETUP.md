# Environment Variables Setup

## Quick Fix for Black Screen Issue

If you're seeing a black screen with "No projectId found" error, create a `.env.local` file in the root directory with:

```env
VITE_NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=2ec9743d0d0cd7fb94dee1a7e6d33475
VITE_NEXT_PUBLIC_RPC_URL=https://1rpc.io/sepolia
```

## Complete Environment Variables

For full functionality, create `.env.local` with:

```env
# Network Configuration
VITE_NEXT_PUBLIC_CHAIN_ID=11155111
VITE_NEXT_PUBLIC_RPC_URL=https://1rpc.io/sepolia

# Wallet Connect Configuration
VITE_NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=2ec9743d0d0cd7fb94dee1a7e6d33475

# Infura Configuration (Optional)
VITE_NEXT_PUBLIC_INFURA_API_KEY=your_infura_key_here
```

## Steps to Fix

1. Create `.env.local` file in project root
2. Add the environment variables above
3. Restart the development server: `npm run dev`
4. The page should now load properly

## Default Values

The application includes default values, so it should work even without environment variables, but for production use, you should:

1. Get your own WalletConnect Project ID from [WalletConnect Cloud](https://cloud.walletconnect.com)
2. Get your own Infura API key from [Infura](https://infura.io)
3. Replace the default values with your own

## Security Note

Never commit `.env.local` to version control. It's already included in `.gitignore`.
