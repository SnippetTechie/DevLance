// src/utils/contract.js
import { ethers } from 'ethers';
import abi from '../contracts/devlance.abi.json';

const CONTRACT_ADDRESS = import.meta.env.VITE_ESCROW_CONTRACT_ADDRESS || '';

function getBrowserProvider() {
  if (typeof window === 'undefined' || !window.ethereum) return null;
  return new ethers.BrowserProvider(window.ethereum);
}

export function getReadProvider() {
  // prefer injected read provider; fallback to JSON-RPC if configured
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  const fallback = import.meta.env.VITE_FALLBACK_RPC || null;
  if (fallback) return new ethers.JsonRpcProvider(fallback);
  return ethers.getDefaultProvider();
}

export function getSigner() {
  const provider = getBrowserProvider();
  if (!provider) throw new Error('No injected wallet (MetaMask) available');
  // request accounts should be called by UI / wallet connect handlers; keep here defensive
  return provider.getSigner();
}

export function getContract(signerOrProvider) {
  if (!CONTRACT_ADDRESS) throw new Error('Missing VITE_ESCROW_CONTRACT_ADDRESS in .env');
  return new ethers.Contract(CONTRACT_ADDRESS, abi, signerOrProvider);
}

/**
 * createGigOnchain
 * params: { ipfsCID, amountWei, deadlineDays, valueWei }
 * returns the tx response
 */
export async function createGigOnchain({ ipfsCID, amountWei, deadlineDays, valueWei }) {
  const signer = getSigner();
  const contract = getContract(signer);
  const tx = await contract.createGig(ipfsCID, BigInt(amountWei), Number(deadlineDays), {
    value: BigInt(valueWei),
  });
  return tx;
}

// export commonly used read helpers
export async function readJob(jobId) {
  const provider = getReadProvider();
  const contract = getContract(provider);
  const raw = await contract.getJob(Number(jobId));
  return raw;
}

export async function readJobMetadata(jobId) {
  const provider = getReadProvider();
  const contract = getContract(provider);
  const cid = await contract.getJobMetadata(Number(jobId));
  return cid;
}
