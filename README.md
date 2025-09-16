# Cipher Vote Haven

A secure, privacy-preserving governance platform powered by Fully Homomorphic Encryption (FHE). Cast votes privately while ensuring transparent results once quorum is reached.

## Features

- **Private Voting**: Cast encrypted votes using FHE technology
- **Transparent Results**: Decrypt and display results after voting ends
- **Secure Governance**: Built on blockchain with smart contract integration
- **Modern UI**: Clean, responsive interface built with React and Tailwind CSS
- **Wallet Integration**: Connect with popular Web3 wallets

## Technologies

This project is built with:

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui, Radix UI, Tailwind CSS
- **Blockchain**: Ethereum, FHE (Fully Homomorphic Encryption)
- **Wallet Integration**: RainbowKit, Wagmi, Viem
- **State Management**: TanStack Query
- **Routing**: React Router DOM

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/devKitten42/cipher-vote-haven.git

# Navigate to the project directory
cd cipher-vote-haven

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/b18fb7e6ca7045ac83c41157ab93f990
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=2ec9743d0d0cd7fb94dee1a7e6d33475
NEXT_PUBLIC_INFURA_API_KEY=b18fb7e6ca7045ac83c41157ab93f990
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── GovernanceHeader.tsx
│   ├── ProposalCard.tsx
│   ├── ResultsChart.tsx
│   └── VotingModal.tsx
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── pages/              # Page components
└── contracts/          # Smart contract files
```

## Smart Contracts

The project includes FHE-enabled smart contracts for secure voting:

- **Voting Contract**: Handles encrypted vote submission and tallying
- **Governance Contract**: Manages proposals and voting periods
- **FHE Integration**: Uses Zama's FHE technology for privacy-preserving computations

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Security

This project implements several security measures:

- Fully Homomorphic Encryption for vote privacy
- Smart contract-based vote verification
- Secure wallet integration
- Input validation and sanitization

## License

MIT License - see LICENSE file for details

## Support

For support and questions, please open an issue on GitHub.