# Environment Variables Setup

This document explains how to configure the environment variables for Cipher Vote Haven.

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Network Configuration
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY

# Wallet Connect Configuration
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=YOUR_WALLET_CONNECT_PROJECT_ID

# Infura Configuration (Optional)
NEXT_PUBLIC_INFURA_API_KEY=YOUR_INFURA_API_KEY

# Alternative RPC URL (Optional)
NEXT_PUBLIC_RPC_URL=https://1rpc.io/sepolia
```

## How to Get These Values

### 1. Infura API Key
1. Go to [Infura](https://infura.io)
2. Create an account or sign in
3. Create a new project
4. Copy the project ID from the project settings

### 2. WalletConnect Project ID
1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com)
2. Create an account or sign in
3. Create a new project
4. Copy the project ID from the project settings

### 3. Chain ID
- Sepolia Testnet: `11155111`
- Ethereum Mainnet: `1`
- Polygon: `137`

## Security Notes

- Never commit your `.env.local` file to version control
- Use different API keys for development and production
- Rotate your API keys regularly
- Keep your private keys secure

## Vercel Deployment

When deploying to Vercel, add these environment variables in the Vercel dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add each variable with the appropriate value
4. Select the environments (Production, Preview, Development)

## Local Development

1. Copy the example above to `.env.local`
2. Replace the placeholder values with your actual keys
3. Restart your development server
4. The application will use these environment variables
