// src/hooks/useConfig.js
import { useMemo } from 'react';

/**
 * useConfig - read configuration directly from import.meta.env
 * No network call, no mocks. Always deterministic from environment.
 */
export default function useConfig() {
  const config = useMemo(() => {
    return {
      chainId: import.meta.env.VITE_CHAIN_ID || null,
      networkName: import.meta.env.VITE_NETWORK_NAME || null,
      demoMode: import.meta.env.VITE_DEMO_MODE === 'true' ? true : false,
      apiBaseUrl: import.meta.env.VITE_API_BASE_URL || null,
      escrowContractAddress: import.meta.env.VITE_ESCROW_CONTRACT_ADDRESS || null,
      ipfsGateway: import.meta.env.VITE_IPFS_GATEWAY || null,
      explorerTxUrl: import.meta.env.VITE_EXPLORER_TX_URL || null,
      configSource: 'env',
    };
  }, []);

  // synchronous, no loading state needed (pure env)
  return { config, loading: false };
}
