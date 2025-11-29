import { useState, useEffect } from 'react';

/**
 * useWallet
 * - Mock connect stored in localStorage (quick)
 * - TODO: replace with wagmi/web3modal/ethers integration for real wallet connect
 */
export default function useWallet() {
  const [wallet, setWallet] = useState(null);
  const [role, setRole] = useState('client');

  useEffect(() => {
    const w = localStorage.getItem('devlance_wallet');
    const r = localStorage.getItem('devlance_role');
    if (w) setWallet(w);
    if (r) setRole(r);
  }, []);

  useEffect(() => {
    if (wallet) localStorage.setItem('devlance_wallet', wallet);
    else localStorage.removeItem('devlance_wallet');
  }, [wallet]);

  useEffect(() => {
    localStorage.setItem('devlance_role', role);
  }, [role]);

  const connect = async () => {
    // quick mock: you can replace this with Web3Modal/wagmi connect flow
    const mock = '0xAbCDEF0123456789abcdef0123456789AbCdEf01';
    setWallet(mock);
  };

  const disconnect = () => {
    setWallet(null);
  };

  return { wallet, connect, disconnect, role, setRole };
}
