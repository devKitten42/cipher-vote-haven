# 🚀 Cipher Vote Haven - Deployment Guide

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git installed
- Web3 wallet (MetaMask, Rainbow, etc.)
- Sepolia testnet ETH for gas fees

## 🔧 Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/devKitten42/cipher-vote-haven.git
cd cipher-vote-haven
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create `.env.local` file:

```env
# Network Configuration
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://1rpc.io/sepolia

# Wallet Connect
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=YOUR_WALLET_CONNECT_PROJECT_ID

# Optional: Alternative RPC
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
```

## 🏗️ Smart Contract Deployment

### Current Contract Information

- **Address**: `0x73b15e203DC18ab1d8d8F34473dC9f95a7CF1083`
- **Network**: Ethereum Sepolia Testnet
- **Explorer**: [View on Etherscan](https://sepolia.etherscan.io/address/0x73b15e203DC18ab1d8d8F34473dC9f95a7CF1083)

### Deploy New Contract

```bash
# Deploy to Sepolia testnet
npx hardhat run scripts/deploy.cjs --network sepolia

# Verify contract on Etherscan
npx hardhat verify --network sepolia CONTRACT_ADDRESS
```

### Contract Features

- ✅ FHE Encryption using Zama FHEVM
- ✅ Voter self-registration system
- ✅ Proposal creation and management
- ✅ Encrypted vote casting
- ✅ Result decryption after voting ends
- ✅ Quorum threshold management

## 🌐 Frontend Deployment

### Local Development

```bash
# Start development server
npm run dev

# Visit http://localhost:8080
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Vercel Deployment

1. Connect GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

```bash
# Build the application
npm run build

# Deploy to your hosting provider
# Upload dist/ folder contents
```

## 🔐 Security Considerations

### Environment Variables

- Never commit `.env.local` to version control
- Use different keys for development and production
- Rotate API keys regularly

### Smart Contract Security

- Contract is deployed on Sepolia testnet (for testing)
- Mainnet deployment requires additional security audits
- FHE encryption provides vote privacy
- Zero-knowledge proofs ensure vote validity

## 📊 Performance Optimization

### Build Optimization

- Code splitting for faster loading
- Tree shaking to reduce bundle size
- Image optimization for assets
- CDN deployment for global access

### Gas Optimization

- Efficient smart contract design
- Batch operations where possible
- Optimized FHE computations
- Minimal storage operations

## 🧪 Testing

### Frontend Testing

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e
```

### Smart Contract Testing

```bash
# Run Hardhat tests
npx hardhat test

# Run coverage report
npx hardhat coverage
```

## 📱 Mobile Optimization

- Responsive design for all screen sizes
- Touch-friendly interface
- Mobile wallet integration
- Offline capability for viewing results

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npm run deploy
```

## 📈 Monitoring

### Analytics

- User interaction tracking
- Vote participation metrics
- Performance monitoring
- Error tracking and reporting

### Health Checks

- Contract connectivity
- FHE service availability
- Wallet connection status
- Network performance

## 🆘 Troubleshooting

### Common Issues

1. **Wallet Connection Failed**
   - Check network configuration
   - Ensure Sepolia testnet is selected
   - Verify wallet has testnet ETH

2. **FHE Encryption Errors**
   - Check Zama FHEVM service status
   - Verify browser compatibility
   - Clear browser cache and retry

3. **Contract Interaction Failed**
   - Verify contract address
   - Check gas fees and balance
   - Ensure contract is deployed

### Support Resources

- [GitHub Issues](https://github.com/devKitten42/cipher-vote-haven/issues)
- [Documentation](https://github.com/devKitten42/cipher-vote-haven/wiki)
- [FHE Documentation](https://docs.zama.ai/fhevm)

## 🎯 Next Steps

1. **Mainnet Deployment**: Deploy to Ethereum mainnet
2. **Security Audit**: Professional smart contract audit
3. **Mobile App**: Native mobile application
4. **Advanced Features**: Multi-signature voting, delegation
5. **Integration**: Connect with other governance platforms

---

**Built with ❤️ for privacy-first governance**
