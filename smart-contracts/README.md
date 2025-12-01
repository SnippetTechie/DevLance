# DevLance Smart Contracts

The blockchain layer for the DevLance freelance marketplace. Built with Hardhat and Solidity.

## 📂 Structure

- `contracts/` - Solidity smart contracts (`DevLance.sol`)
- `scripts/` - Deployment scripts
- `test/` - Comprehensive test suite

## 🚀 Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   Copy `.env.example` to `.env` and fill in your keys:
   
   Required variables:
   - `SEPOLIA_URL`: RPC URL for Sepolia (e.g., Alchemy/Infura)
   - `SECRET_KEY`: Wallet private key (for deployment)
   - `ETHERSCAN_KEY`: API key for contract verification

## 🧪 Testing

Run the full test suite (28 tests):
```bash
npx hardhat test
```

## 📜 Deployment

**Deploy to Sepolia Testnet:**
```bash
npm run deploy:sepolia
```
*This will update `deployments.json` with the new contract address.*

**Verify on Etherscan:**
```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

## 🔗 Contract Details

- **Network**: Sepolia Testnet
- **Solidity Version**: 0.8.28
- **Features**:
  - Escrow with 5% security hold
  - IPFS metadata integration
  - Deadline enforcement
  - Full/Partial payment release

## 📝 License

MIT
