// src/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
const IPFS_GATEWAY = import.meta.env.VITE_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/';

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  };

  const response = await fetch(url, config);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`);
  }
  return response.json();
}

export async function uploadToIPFS(metadata) {
  const response = await apiRequest('/ipfs', {
    method: 'POST',
    body: JSON.stringify({ metadata }),
  });
  return {
    cid: response.hash || response.cid || response.IpfsHash,
    url: `${IPFS_GATEWAY}${response.hash || response.cid || response.IpfsHash}`,
  };
}

export async function fetchFromIPFS(cid) {
  if (!cid) return null;
  const cleanCID = cid.replace(/^ipfs:\/\//, '').replace(/^\/ipfs\//, '').trim();
  if (!cleanCID) return null;

  try {
    const response = await fetch(`${IPFS_GATEWAY}${cleanCID}`, {
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error(`IPFS fetch failed: ${response.status}`);
    return response.json();
  } catch (error) {
    console.error('IPFS fetch error:', error);
    return null;
  }
}

export function createJobMetadata({ title, description, skills = [], budget, deadline, clientAddress }) {
  return {
    version: '1.0',
    type: 'devlance-job',
    title,
    shortDesc: description,
    description,
    skills: Array.isArray(skills) ? skills : [],
    budget: { amount: budget, currency: 'ETH' },
    deadline,
    client: clientAddress,
    createdAt: new Date().toISOString(),
  };
}

export function createSubmissionMetadata({ jobId, description, links = [], developerAddress, notes = '' }) {
  return {
    version: '1.0',
    type: 'devlance-submission',
    jobId,
    title: `Submission for Job #${jobId}`,
    shortDesc: description.substring(0, 200),
    description,
    links: Array.isArray(links) ? links : [],
    developer: developerAddress,
    notes,
    submittedAt: new Date().toISOString(),
  };
}

export function getIPFSUrl(cid) {
  if (!cid) return '';
  const cleanCID = cid.replace(/^ipfs:\/\//, '').replace(/^\/ipfs\//, '').trim();
  return `${IPFS_GATEWAY}${cleanCID}`;
}

export function getExplorerTxUrl(txHash) {
  const baseUrl = import.meta.env.VITE_EXPLORER_TX_URL || 'https://sepolia.etherscan.io/tx/';
  return `${baseUrl}${txHash}`;
}

export function getExplorerAddressUrl(address) {
  return `https://sepolia.etherscan.io/address/${address}`;
}

export default {
  uploadToIPFS, fetchFromIPFS, createJobMetadata, createSubmissionMetadata,
  getIPFSUrl, getExplorerTxUrl, getExplorerAddressUrl,
};