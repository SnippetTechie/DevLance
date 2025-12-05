// src/context/WalletContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

const WalletContext = createContext(null);

const SEPOLIA_CHAIN_ID = '0xaa36a7';
const SEPOLIA_CONFIG = {
  chainId: SEPOLIA_CHAIN_ID,
  chainName: 'Sepolia Testnet',
  nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: ['https://rpc.sepolia.org'],
  blockExplorerUrls: ['https://sepolia.etherscan.io'],
};

export function WalletProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  const isMetaMaskInstalled = useCallback(() => {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  }, []);

  const isCorrectNetwork = useCallback(() => {
    if (!chainId) return false;
    const normalized = typeof chainId === 'string' ? chainId.toLowerCase() : `0x${chainId.toString(16)}`;
    return normalized === SEPOLIA_CHAIN_ID;
  }, [chainId]);

  const switchToSepolia = useCallback(async () => {
    if (!isMetaMaskInstalled()) throw new Error('MetaMask not installed');
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
    } catch (err) {
      if (err.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [SEPOLIA_CONFIG],
        });
      } else throw err;
    }
  }, [isMetaMaskInstalled]);

  const updateBalance = useCallback(async (address, prov) => {
    if (!address || !prov) return;
    try {
      const bal = await prov.getBalance(address);
      setBalance(bal);
    } catch (e) {
      console.error('Balance fetch failed:', e);
    }
  }, []);

  const connect = useCallback(async () => {
    if (!isMetaMaskInstalled()) {
      setError('MetaMask is not installed');
      return null;
    }
    setIsConnecting(true);
    setError(null);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (!accounts?.length) throw new Error('No accounts found');

      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const currentSigner = await browserProvider.getSigner();
      const address = await currentSigner.getAddress();
      const network = await browserProvider.getNetwork();
      const currentChainId = '0x' + network.chainId.toString(16);

      setProvider(browserProvider);
      setSigner(currentSigner);
      setAccount(address);
      setChainId(currentChainId);
      await updateBalance(address, browserProvider);

      if (currentChainId.toLowerCase() !== SEPOLIA_CHAIN_ID) {
        try { await switchToSepolia(); } 
        catch (e) { setError('Please switch to Sepolia'); }
      }
      setIsConnecting(false);
      return address;
    } catch (e) {
      setError(e.message || 'Failed to connect');
      setIsConnecting(false);
      return null;
    }
  }, [isMetaMaskInstalled, switchToSepolia, updateBalance]);

  const disconnect = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setBalance(null);
    setError(null);
  }, []);

  useEffect(() => {
    if (!isMetaMaskInstalled()) return;

    const handleAccountsChanged = async (accounts) => {
      if (!accounts.length) disconnect();
      else if (accounts[0] !== account) {
        setAccount(accounts[0]);
        if (provider) {
          const newSigner = await provider.getSigner();
          setSigner(newSigner);
          await updateBalance(accounts[0], provider);
        }
      }
    };

    const handleChainChanged = () => window.location.reload();
    const handleDisconnect = () => disconnect();

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('disconnect', handleDisconnect);

    return () => {
      window.ethereum.removeListener?.('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener?.('chainChanged', handleChainChanged);
      window.ethereum.removeListener?.('disconnect', handleDisconnect);
    };
  }, [account, provider, disconnect, isMetaMaskInstalled, updateBalance]);

  useEffect(() => {
    if (!isMetaMaskInstalled()) return;
    (async () => {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts?.length) {
          const browserProvider = new ethers.BrowserProvider(window.ethereum);
          const currentSigner = await browserProvider.getSigner();
          const address = await currentSigner.getAddress();
          const network = await browserProvider.getNetwork();
          setProvider(browserProvider);
          setSigner(currentSigner);
          setAccount(address);
          setChainId('0x' + network.chainId.toString(16));
          await updateBalance(address, browserProvider);
        }
      } catch (e) { console.error('Auto-connect failed:', e); }
    })();
  }, [isMetaMaskInstalled, updateBalance]);

  const formattedBalance = balance ? parseFloat(ethers.formatEther(balance)).toFixed(4) : '0.0000';
  const shortAddress = account ? `${account.slice(0, 6)}...${account.slice(-4)}` : null;

  return (
    <WalletContext.Provider value={{
      account, provider, signer, chainId, balance, formattedBalance, shortAddress,
      isConnecting, error, isConnected: !!account, isCorrectNetwork: isCorrectNetwork(),
      isMetaMaskInstalled: isMetaMaskInstalled(), connect, disconnect, switchToSepolia,
      updateBalance: () => updateBalance(account, provider), clearError: () => setError(null),
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet must be used within WalletProvider');
  return context;
}

export default WalletContext;