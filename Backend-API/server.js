import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PinataSDK } from 'pinata-web3';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
});

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'DevLance API is running',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/ipfs', async (req, res) => {
  try {
    const { metadata } = req.body;
    if (!metadata) {
      return res.status(400).json({ 
        error: 'Metadata is required',
        message: 'Please provide metadata object in request body'
      });
    }

    if (!metadata.title || !metadata.shortDesc) {
      return res.status(400).json({
        error: 'Invalid metadata',
        message: 'Metadata must include title and shortDesc'
      });
    }

    console.log('Pinning metadata to IPFS:', metadata.title);

    const upload = await pinata.upload.json(metadata);
    
    const ipfsHash = upload.IpfsHash;
    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

    console.log('Successfully pinned to IPFS:', ipfsHash);

    res.json({
      hash: ipfsHash,
      url: ipfsUrl,
      gateway: 'https://gateway.pinata.cloud/ipfs/',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('IPFS pinning error:', error);
    
    if (error.message?.includes('JWT')) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid or missing Pinata JWT token. Please check your .env file.'
      });
    }

    res.status(500).json({
      error: 'Pinning failed',
      message: error.message || 'An error occurred while pinning to IPFS',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

app.get('/api/ipfs/:cid', async (req, res) => {
  try {
    const { cid } = req.params;

    if (!cid) {
      return res.status(400).json({
        error: 'CID is required',
        message: 'Please provide an IPFS CID'
      });
    }

    console.log('Fetching metadata from IPFS:', cid);

    const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch from IPFS: ${response.statusText}`);
    }

    const metadata = await response.json();

    console.log('Successfully fetched from IPFS:', cid);

    res.json({
      cid,
      metadata,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('IPFS fetch error:', error);
    
    res.status(500).json({
      error: 'Fetch failed',
      message: error.message || 'An error occurred while fetching from IPFS'
    });
  }
});

app.get('/api/config', (req, res) => {
  res.json({
    chainId: '0xaa36a7',
    networkName: 'Sepolia',
    demoMode: false,
    ipfsGateway: 'https://gateway.pinata.cloud/ipfs/',
    explorerUrl: 'https://sepolia.etherscan.io',
    timestamp: new Date().toISOString()
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`,
    availableEndpoints: [
      'GET /api/health',
      'POST /api/ipfs',
      'GET /api/ipfs/:cid',
      'GET /api/config'
    ]
  });
});

app.use((err, req, res, next) => {
  console.error(' Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

app.listen(PORT, () => {
  console.log(`Server running on: http://localhost:${PORT}`);
  
  if (!process.env.PINATA_JWT || process.env.PINATA_JWT === 'your_pinata_jwt_token_here') {
    console.warn(`Pinata JWT not configured!`);
  } else {
    console.log(`Pinata JWT configured successfully`);
  }
});

export default app;