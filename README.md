# 🔐 Cipher Vote Haven

> **Privacy-First Governance Platform** powered by Fully Homomorphic Encryption

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/devKitten42/cipher-vote-haven)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)

## 🌟 What Makes Us Different?

Unlike traditional voting systems, **Cipher Vote Haven** revolutionizes governance through:

- 🔒 **Zero-Knowledge Privacy**: Your vote remains encrypted until results are revealed
- ⚡ **Real-time Encryption**: FHE technology ensures data privacy on-chain
- 🎯 **Transparent Results**: Decrypted outcomes only after quorum is reached
- 🔗 **Blockchain Security**: Immutable voting records with smart contract validation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Web3 wallet (MetaMask, Rainbow, etc.)

### Installation

```bash
# Clone the repository
git clone https://github.com/devKitten42/cipher-vote-haven.git
cd cipher-vote-haven

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:8080` to see the application.

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Smart Contract │    │   FHE Network   │
│   (React/Vite)  │◄──►│   (Solidity)     │◄──►│   (Zama)        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Core Components

- **🎨 Frontend**: Modern React app with TypeScript
- **🔗 Blockchain**: Ethereum Sepolia testnet integration
- **🔐 Encryption**: Zama FHE for privacy-preserving computations
- **💼 Wallet**: Multi-wallet support via RainbowKit

## 🛠️ Technology Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Frontend** | React 18, TypeScript, Vite | Modern web application |
| **UI/UX** | Tailwind CSS, shadcn/ui | Beautiful, accessible interface |
| **Blockchain** | Ethereum, Wagmi, Viem | Web3 integration |
| **Encryption** | FHEVM, Zama | Privacy-preserving voting |
| **Wallet** | RainbowKit | Multi-wallet connectivity |

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```env
# Network Configuration
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY

# Wallet Connect
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=YOUR_WALLET_CONNECT_PROJECT_ID

# Infura Configuration
NEXT_PUBLIC_INFURA_API_KEY=YOUR_INFURA_API_KEY

# Optional: Alternative RPC
NEXT_PUBLIC_RPC_URL=https://1rpc.io/sepolia
```

### Smart Contract Deployment

```bash
# Deploy to Sepolia testnet
npx hardhat run scripts/deploy.js --network sepolia
```

## 📱 Features

### 🗳️ Voting System
- **Private Ballots**: Encrypted vote submission
- **Quorum Management**: Automatic result revelation
- **Vote Verification**: Cryptographic proof validation

### 👥 Governance
- **Proposal Creation**: Community-driven initiatives
- **Voting Periods**: Configurable time windows
- **Result Analytics**: Real-time vote tracking

### 🔐 Security
- **FHE Encryption**: Votes encrypted on-chain
- **Zero-Knowledge Proofs**: Vote validity without revealing choice
- **Smart Contract Validation**: Immutable voting rules

## 🎯 Usage Examples

### Creating a Proposal

```typescript
const proposal = await contract.createProposal(
  "Increase Development Fund",
  "Allocate additional resources for Q2 development",
  7 * 24 * 60 * 60, // 7 days in seconds
  1000 // Quorum threshold
);
```

### Casting a Vote

```typescript
const vote = await contract.castVote(
  proposalId,
  encryptedVoteChoice, // FHE encrypted
  proof // Zero-knowledge proof
);
```

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Test smart contracts
npx hardhat test
```

## 📊 Performance Metrics

- **⚡ Build Time**: < 30 seconds
- **🚀 First Load**: < 2 seconds
- **🔒 Encryption**: < 1 second per vote
- **📱 Mobile**: Fully responsive

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md).

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📖 [Documentation](https://docs.ciphervotehaven.com)
- 💬 [Discord Community](https://discord.gg/ciphervotehaven)
- 🐛 [Issue Tracker](https://github.com/devKitten42/cipher-vote-haven/issues)
- 📧 [Email Support](mailto:support@ciphervotehaven.com)

## 🌐 Live Demo

Experience Cipher Vote Haven: [https://cipher-vote-haven.vercel.app](https://cipher-vote-haven.vercel.app)

---

<div align="center">

**Built with ❤️ for privacy-first governance**

[⭐ Star us on GitHub](https://github.com/devKitten42/cipher-vote-haven) | [🐦 Follow us on Twitter](https://twitter.com/ciphervotehaven)

</div>