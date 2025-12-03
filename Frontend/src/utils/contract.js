import { ethers } from 'ethers';
import abi from '../contracts/devlance.abi.json';

const CONTRACT_ADDRESS = import.meta.env.VITE_ESCROW_CONTRACT_ADDRESS || '';
const CHAIN_ID = import.meta.env.VITE_CHAIN_ID || null;

export function getProvider() {
  if (typeof window === 'undefined' || !window.ethereum) return null;
  return new ethers.BrowserProvider(window.ethereum);
}

export async function getSigner() {
  const provider = getProvider();
  if (!provider) throw new Error('No injected wallet (MetaMask) available');
  await provider.send('eth_requestAccounts', []);
  return provider.getSigner();
}

export function getContract(signerOrProvider) {
  if (!CONTRACT_ADDRESS) throw new Error('Contract address missing. Set VITE_ESCROW_CONTRACT_ADDRESS in .env');
  return new ethers.Contract(CONTRACT_ADDRESS, abi, signerOrProvider);
}

export async function createGigOnchain({ ipfsCID, amountWei, deadlineDays, valueWei }) {
  const signer = await getSigner();
  const contract = getContract(signer);

  const tx = await contract.createGig(ipfsCID, amountWei.toString(), deadlineDays, {
    value: valueWei.toString(),
  });
  return tx;
}
