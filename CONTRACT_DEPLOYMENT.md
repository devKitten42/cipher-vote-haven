# Smart Contract Deployment Guide

This guide explains how to deploy the CipherVoteHaven smart contract with FHE encryption capabilities.

## Prerequisites

1. **Node.js** (v18 or higher)
2. **Hardhat** development environment
3. **Private key** for deployment account
4. **Sepolia ETH** for gas fees (if deploying to testnet)

## Environment Setup

1. Create a `.env` file in the root directory:

```env
# Network Configuration
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_private_key_here

# Optional: For contract verification
ETHERSCAN_API_KEY=your_etherscan_api_key
```

2. Install dependencies:

```bash
npm install
```

## Contract Compilation

Compile the smart contract:

```bash
npm run compile
```

This will create the contract artifacts in the `artifacts/` directory.

## Testing

Run the test suite to ensure the contract works correctly:

```bash
npm run test
```

The tests cover:
- Contract deployment
- Voter registration
- Proposal creation
- Voting with FHE encryption
- Proposal management

## Deployment Options

### Local Development

1. Start a local Hardhat node:

```bash
npm run node
```

2. In a new terminal, deploy to local network:

```bash
npm run deploy:local
```

### Sepolia Testnet

1. Ensure you have Sepolia ETH in your deployment account
2. Deploy to Sepolia:

```bash
npm run deploy:sepolia
```

3. Note the deployed contract address from the output

## Contract Verification

After deployment, verify the contract on Etherscan:

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

## Frontend Integration

1. Update the contract address in `src/lib/contract.ts`:

```typescript
export const CONTRACT_ADDRESS = "0x..."; // Your deployed contract address
```

2. The contract ABI is already configured in the same file

## Contract Features

### FHE Encryption
- Uses Zama's FHEVM for encrypted voting
- Votes are encrypted on-chain using `euint8` data types
- Zero-knowledge proofs for vote validity

### Key Functions
- `createProposal()` - Create new governance proposals
- `castVote()` - Cast encrypted votes
- `registerVoter()` - Register eligible voters
- `endProposal()` - End voting and reveal results
- `getProposalInfo()` - Retrieve proposal details

### Security Features
- Only verified voters can participate
- One vote per voter per proposal
- Time-based voting periods
- Quorum requirements
- Owner-only voter registration

## Gas Optimization

The contract is optimized for gas efficiency:
- Uses `uint8` for vote counts (saves gas)
- Efficient storage patterns
- Minimal external calls

## Monitoring

After deployment, monitor:
- Contract interactions on Etherscan
- Gas usage patterns
- Voting participation rates
- Proposal success rates

## Troubleshooting

### Common Issues

1. **Insufficient Gas**: Ensure deployment account has enough ETH
2. **Network Issues**: Check RPC URL and network configuration
3. **Compilation Errors**: Ensure all dependencies are installed
4. **Deployment Failures**: Check private key and network settings

### Support

For issues with:
- **FHEVM Integration**: Check Zama documentation
- **Hardhat**: Refer to Hardhat documentation
- **Contract Logic**: Review test cases and contract code

## Next Steps

1. Deploy the contract to your chosen network
2. Update the frontend with the new contract address
3. Test all functionality end-to-end
4. Monitor contract performance
5. Consider upgrading to mainnet when ready
