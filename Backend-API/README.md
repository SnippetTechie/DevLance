# DevLance Backend API

Backend API server for DevLance that handles IPFS metadata pinning using Pinata.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd Backend-API
npm install
```

### 2. Get Pinata API Key

1. Go to [Pinata Cloud](https://app.pinata.cloud/developers/api-keys)
2. Sign up for a free account (1GB free storage)
3. Click "New Key" or "API Keys"
4. Create a new API key with these permissions:
   - ✅ `pinFileToIPFS`
   - ✅ `pinJSONToIPFS`
5. Copy the **JWT token** (it starts with `eyJ...`)

### 3. Configure Environment

```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your Pinata JWT
# PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

### 4. Run the Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:4000`

## 📄 License

MIT
