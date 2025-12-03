// src/utils/contracts.js
import { ethers } from 'ethers';
import abi from '../contracts/devlance.abi.json';

const CONTRACT_ADDRESS = import.meta.env.VITE_ESCROW_CONTRACT_ADDRESS || '';
const CHAIN_ID = import.meta.env.VITE_CHAIN_ID || null;

/**
 * Use only the injected MetaMask provider (no external RPC).
 * This will route read/write calls through whatever RPC the user has configured in MetaMask.
 * Throws null if no wallet is available.
 */
export function getProvider() {
  if (typeof window === 'undefined' || !window.ethereum) return null;
  return new ethers.BrowserProvider(window.ethereum);
}

/**
 * Return a signer for sending transactions.
 * NOTE: this will call eth_requestAccounts(), which should be triggered from
 * a user click handler to ensure MetaMask popup is allowed.
 */
export async function getSigner() {
  const provider = getProvider();
  if (!provider) throw new Error('No injected wallet (MetaMask) available. Please install MetaMask or use a browser with an injected wallet.');
  // caller should ensure this runs from a user gesture when you want the popup
  await provider.send('eth_requestAccounts', []);
  return provider.getSigner();
}

/**
 * Create a contract instance bound to a signer or provider.
 */
export function getContract(signerOrProvider) {
  if (!CONTRACT_ADDRESS) throw new Error('Contract address missing. Set VITE_ESCROW_CONTRACT_ADDRESS in .env');
  return new ethers.Contract(CONTRACT_ADDRESS, abi, signerOrProvider);
}

/**
 * createGigOnchain: unchanged semantics - uses signer and sends msg.value (valueWei)
 */
export async function createGigOnchain({ ipfsCID, amountWei, deadlineDays, valueWei }) {
  const signer = await getSigner();
  const contract = getContract(signer);

  const tx = await contract.createGig(ipfsCID, amountWei.toString(), deadlineDays, {
    value: valueWei.toString(),
  });
  return tx;
}

/* ----------------------
   Read helpers (safe)
   - fetchJobsPage: page-wise fetch
   - fetchAllJobsConcurrently: utility with concurrency limit (use with care)
   ---------------------- */

/**
 * Map raw contract getJob return to a JS object.
 * raw is expected to be the tuple returned by getJob(jobId)
 */
function mapRawJob(raw) {
  const [
    id,
    client,
    developer,
    amount,
    securityHold,
    originalAmount,
    ipfsCID,
    submission,
    deadline,
    status
  ] = raw;

  return {
    id: Number(id),
    client,
    developer: developer === ethers.ZeroAddress ? null : developer,
    amountWei: amount.toString(),
    securityHoldWei: securityHold.toString(),
    originalAmountWei: originalAmount.toString(),
    ipfsCID,
    submission,
    deadline: Number(deadline),
    status: Number(status),
  };
}

/**
 * Fetch a page of jobs (safe for using with MetaMask provider).
 * pageIndex: 0-based page index
 * pageSize: number of jobs per page
 *
 * This avoids requesting *all* jobs at once and spamming the provider.
 */
export async function fetchJobsPage(pageIndex = 0, pageSize = 10) {
  const provider = getProvider();
  if (!provider) throw new Error('No provider available. Connect MetaMask.');

  const contract = getContract(provider);

  // nextJobId() returns BigInt
  const nextIdBn = await contract.nextJobId();
  const nextId = Number(nextIdBn || 0n);

  const start = pageIndex * pageSize;
  if (start >= nextId) return { jobs: [], total: nextId };

  const end = Math.min(nextId, start + pageSize);
  const jobs = [];

  // sequential-ish but you can tune concurrency if desired
  for (let i = start; i < end; i++) {
    try {
      const raw = await contract.getJob(i);
      jobs.push(mapRawJob(raw));
    } catch (err) {
      // don't fail whole page for one bad entry
      console.warn(`Failed to fetch job ${i}`, err);
    }
  }

  return { jobs, total: nextId };
}

/**
 * Fetch all jobs but with a concurrency limit (useful for smaller datasets).
 * WARNING: still makes many RPC calls if nextJobId is large. Prefer fetchJobsPage.
 */
export async function fetchAllJobsConcurrently(concurrency = 5) {
  const provider = getProvider();
  if (!provider) throw new Error('No provider available. Connect MetaMask.');

  const contract = getContract(provider);
  const nextIdBn = await contract.nextJobId();
  const nextId = Number(nextIdBn || 0n);

  const results = new Array(nextId);
  let idx = 0;

  // simple concurrency worker pool
  async function worker() {
    while (true) {
      const i = idx++;
      if (i >= nextId) break;
      try {
        const raw = await contract.getJob(i);
        results[i] = mapRawJob(raw);
      } catch (err) {
        console.warn(`Failed to fetch job ${i}`, err);
        results[i] = null;
      }
    }
  }

  const workers = [];
  for (let w = 0; w < Math.max(1, Math.min(concurrency, nextId)); w++) {
    workers.push(worker());
  }
  await Promise.all(workers);

  return results.filter(Boolean);
}
