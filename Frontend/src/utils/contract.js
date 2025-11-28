// src/utils/contract.js
import { ethers } from 'ethers';
import abi from '../contracts/escrow.abi.json'; // ensure this path exists

const CONTRACT_ADDRESS = import.meta.env.VITE_ESCROW_CONTRACT_ADDRESS || '';
const CHAIN_ID = import.meta.env.VITE_CHAIN_ID || null;

// Return ethers provider (Web3 provider from window.ethereum)
export function getProvider() {
  if (typeof window === 'undefined' || !window.ethereum) return null;
  return new ethers.providers.Web3Provider(window.ethereum);
}

export async function getSigner() {
  const provider = getProvider();
  if (!provider) throw new Error('No injected wallet (MetaMask) available');
  await provider.send('eth_requestAccounts', []); // prompt if needed
  return provider.getSigner();
}

export function getContract(signerOrProvider) {
  if (!CONTRACT_ADDRESS) throw new Error('Contract address missing. Set VITE_ESCROW_CONTRACT_ADDRESS in .env');
  return new ethers.Contract(CONTRACT_ADDRESS, abi, signerOrProvider);
}

/**
 * createGigOnchain
 * - ipfsCID: 'Qm...'
 * - amountWei: string or BigNumber (total amount client pays for gig, excluding security hold? we include amount param as amountWei)
 * - deadlineDays: number
 * - valueWei: string (amount in wei to send as msg.value = amountWei + securityHoldWei)
 */
export async function createGigOnchain({ ipfsCID, amountWei, deadlineDays, valueWei }) {
  const signer = await getSigner();
  const contract = getContract(signer);

  // call createGig(ipfsCID, amountWei, deadlineDays) with { value: valueWei }
  const tx = await contract.createGig(ipfsCID, ethers.BigNumber.from(amountWei.toString()), deadlineDays, {
    value: ethers.BigNumber.from(valueWei.toString()),
  });
  return tx; // return TxResponse; you can wait for tx.wait() where you call this
}
