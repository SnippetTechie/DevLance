// src/hooks/useWallet.js
import { useEffect, useState, useCallback } from 'react';
import { isEthereumAvailable, requestAccounts, getChainId } from '../utils/wallet';

/**
 * Pure on-chain wallet hook.
 * - Only supports injected wallets (window.ethereum / MetaMask).
 * - No mocks, no stored fake addresses.
 * - Exposes: wallet, provider, chainId, role, setRole, connect, disconnect
 */
export default function useWallet() {
  const [wallet, setWallet] = useState(null);     // connected address or null
  const [provider, setProvider] = useState(null); // raw injected provider (window.ethereum) or null
  const [chainId, setChainId] = useState(null);
  const [role, setRole] = useState('client');     // retains your role selection

  // Init: detect injected provider and auto-load connected account if present
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      setProvider(window.ethereum);

      // try reading already-connected accounts (no popup)
      window.ethereum.request({ method: 'eth_accounts' })
        .then(accounts => {
          if (accounts && accounts.length > 0) setWallet(accounts[0]);
        })
        .catch(() => { /* ignore read errors */ });

      // read chain id
      window.ethereum.request({ method: 'eth_chainId' })
        .then(id => setChainId(id))
        .catch(() => { /* ignore */ });
    } else {
      // no injected provider — remain null (no mocks)
      setProvider(null);
      setWallet(null);
      setChainId(null);
    }
  }, []);

  // Listen to provider events
  useEffect(() => {
    if (!provider) return;

    const handleAccountsChanged = (accounts) => {
      if (!accounts || accounts.length === 0) setWallet(null);
      else setWallet(accounts[0]);
    };

    const handleChainChanged = (id) => {
      setChainId(id);
    };

    provider.on?.('accountsChanged', handleAccountsChanged);
    provider.on?.('chainChanged', handleChainChanged);

    return () => {
      provider.removeListener?.('accountsChanged', handleAccountsChanged);
      provider.removeListener?.('chainChanged', handleChainChanged);
    };
  }, [provider]);

  // Connect -> prompts MetaMask popup. Throws if no injected wallet.
  const connect = useCallback(async () => {
    if (!isEthereumAvailable()) throw new Error('No injected wallet found (MetaMask required)');
    const accounts = await requestAccounts(); // will show MetaMask popup
    if (!accounts || accounts.length === 0) throw new Error('No accounts available after connect');
    setWallet(accounts[0]);
    // update provider and chain id after connect
    setProvider(window.ethereum);
    const id = await getChainId().catch(() => null);
    if (id) setChainId(id);
    return accounts[0];
  }, []);

  // Disconnect clears local UI state only (cannot disconnect MetaMask programmatically)
  const disconnect = useCallback(() => {
    setWallet(null);
    // intentionally do not clear provider (window.ethereum still exists)
    setChainId(null);
  }, []);

  // persist only role selection (not wallet) so role UI remains
  useEffect(() => {
    try { localStorage.setItem('devlance_role', role); } catch (e) {}
  }, [role]);

  return { wallet, provider, chainId, role, setRole, connect, disconnect };
}
