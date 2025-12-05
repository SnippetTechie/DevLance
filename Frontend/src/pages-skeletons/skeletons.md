frontend/
├─ node_modules/
├─ .env
├─ .gitignore
├─ src/
│  ├─ components/
│  │  ├─ DashboardHeader.jsx
│  │  └─ RoleButton.jsx
│  │
│  ├─ contexts/
│  │  └─ WalletContext.js
│  │
│  ├─ contracts/
│  │  └─ devlance.abi.json
│  │
│  ├─ hooks/
│  │  ├─ useConfig.js
│  │  ├─ useFetch.js
│  │  ├─ useOnchainJobs.js
│  │  └─ useWallet.js
│  │
│  ├─ pages/
│  │  ├─ ClientDashboard.jsx
│  │  ├─ CreateGig.jsx
│  │  ├─ Landing.jsx
│  │  └─ Marketplace.jsx
│  │
│  ├─ utils/
│  │  ├─ api.js         # optional thin HTTP wrapper for server (if ever needed); NOT for gig data
│  │  ├─ contract.js    # on-chain write utils: createGigOnchain, acceptJob, submitWork, releasePayment...
│  │  ├─ ipfs.js        # pinMetadataJSON, fetchFromGateway helpers
│  │  └─ wallet.js      # isEthereumAvailable, requestAccounts, helper provider wrappers
│  │
│  ├─ App.css
│  ├─ App.jsx
│  ├─ index.css
│  ├─ main.jsx
│  └─ routes.jsx
