// src/components/ConnectWallet.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { requestAccounts, isEthereumAvailable, getChainId } from '../utils/wallet';
import { ethers } from 'ethers';

export default function ConnectWallet({ onConnect, className = '', children }) {
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState(null);

  async function handleClick(evt) {
    evt && evt.preventDefault();
    setLoading(true);
    try {
      if (!isEthereumAvailable()) throw new Error('MetaMask not installed');

      // This call will open MetaMask popup because it's inside a click handler.
      const accounts = await requestAccounts();
      const acct = accounts && accounts[0];
      if (!acct) throw new Error('No account returned');

      // normalize checksum for display (ethers v6)
      let checksum = acct;
      try {
        checksum = ethers.getAddress(acct);
      } catch (e) { /* ignore */ }

      setAddress(checksum);
      if (typeof onConnect === 'function') onConnect(checksum, null);

      // Optionally check chain:
      // const chainId = await getChainId();
      // console.log('connected chain', chainId);
    } catch (err) {
      console.error('ConnectWallet error', err);
      if (typeof onConnect === 'function') onConnect(null, err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={className}
    >
      {loading ? 'Connecting…' : (children || 'Connect Wallet')}
      {address && <span style={{ marginLeft: 8, fontFamily: 'monospace', fontSize: 12 }}>{address.slice(0,6)}…{address.slice(-4)}</span>}
    </button>
  );
}

ConnectWallet.propTypes = {
  onConnect: PropTypes.func,
  className: PropTypes.string,
  children: PropTypes.node,
};
