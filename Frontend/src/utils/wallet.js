// src/utils/wallet.js
export function isEthereumAvailable() {
  return typeof window !== 'undefined' && !!window.ethereum;
}

/**
 * Request accounts (MetaMask popup).
 * Returns array of addresses or throws error if user rejects.
 */
export async function requestAccounts() {
  if (!isEthereumAvailable()) throw new Error('No injected wallet found');
  // This must be called from a user-initiated click handler for a popup to appear reliably.
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  return accounts; // array of addresses (strings)
}

/**
 * Optional: check current chain id
 */
export async function getChainId() {
  if (!isEthereumAvailable()) return null;
  return await window.ethereum.request({ method: 'eth_chainId' });
}
