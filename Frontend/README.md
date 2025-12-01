# DevLance Frontend

The modern React interface for the DevLance freelance marketplace. Built with Vite, TailwindCSS, and Ethers.js v6.

## 🚀 Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   The `.env` file is already configured for Sepolia:
   - `VITE_CHAIN_ID`: 11155111 (Sepolia)
   - `VITE_ESCROW_CONTRACT_ADDRESS`: Your_deployed_contract_address
   - `VITE_API_BASE_URL`: Backend API URL (http://localhost:4000/api)

## 🏃‍♂️ Run Locally

Start the development server:
```bash
npm run dev
```
Access the app at `http://localhost:5173`.

## 🛠 Tech Stack

- **Framework**: React + Vite
- **Styling**: TailwindCSS + Custom Glassmorphism
- **Web3**: Ethers.js v6