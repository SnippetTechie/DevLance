// src/hooks/useOnchainJobs.js
import { useCallback, useEffect, useRef, useState } from 'react';
import { ethers } from 'ethers';
import abi from '../contracts/devlance.abi.json';

/**
 * useOnchainJobs({ ownerAddress })
 * - ownerAddress optional: filter jobs where job.client === ownerAddress
 * Returns: { jobs, loading, error, refresh }
 */
export default function useOnchainJobs({ ownerAddress } = {}) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const contractAddress = import.meta.env.VITE_ESCROW_CONTRACT_ADDRESS;
  const ipfsGateway = import.meta.env.VITE_IPFS_GATEWAY || 'https://ipfs.io/ipfs/';
  const fallbackRpc = import.meta.env.VITE_FALLBACK_RPC || null; // optional read fallback

  const contractRef = useRef(null);
  const providerRef = useRef(null);
  const cleanupRef = useRef(null);

  const makeProvider = useCallback(() => {
    // prefer window.ethereum if available
    if (typeof window !== 'undefined' && window.ethereum) {
      providerRef.current = new ethers.BrowserProvider(window.ethereum);
      return providerRef.current;
    }
    if (fallbackRpc) {
      providerRef.current = new ethers.JsonRpcProvider(fallbackRpc);
      return providerRef.current;
    }
    providerRef.current = ethers.getDefaultProvider();
    return providerRef.current;
  }, [fallbackRpc]);

  const connectContract = useCallback((provider) => {
    if (!contractAddress) throw new Error('Missing VITE_ESCROW_CONTRACT_ADDRESS in .env');
    contractRef.current = new ethers.Contract(contractAddress, abi, provider);
    return contractRef.current;
  }, [contractAddress]);

  const parseJob = useCallback((raw) => {
    if (!raw) return null;
    return {
      jobId: Number(raw.id?.toString?.() ?? raw[0]?.toString?.() ?? -1),
      client: raw.client ?? raw[1],
      developer: raw.developer ?? raw[2],
      amount: raw.amount ? BigInt(raw.amount.toString()) : 0n,
      securityHold: raw.securityHold ? BigInt(raw.securityHold.toString()) : 0n,
      originalAmount: raw.originalAmount ? BigInt(raw.originalAmount.toString()) : 0n,
      ipfsCID: raw.ipfsCID ?? raw[6] ?? '',
      submission: raw.submission ?? raw[7] ?? '',
      deadline: raw.deadline ? BigInt(raw.deadline.toString()) : 0n,
      status: Number(raw.status ?? raw[9] ?? 0),
    };
  }, []);

  const fetchIPFSMetadata = useCallback(async (cid) => {
    if (!cid) return null;
    const clean = cid.replace(/^ipfs:\/\//, '').replace(/^\/ipfs\//, '');
    const url = `${ipfsGateway}${clean}`;
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const json = await res.json();
      return json;
    } catch (e) {
      console.warn('IPFS fetch failed', e);
      return null;
    }
  }, [ipfsGateway]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = makeProvider();
      const contract = connectContract(provider);
      // nextJobId
      let next = 0n;
      try {
        const n = await contract.nextJobId();
        next = BigInt(n.toString ? n.toString() : n);
      } catch (e) {
        next = 0n;
      }
      const max = Number(next > 0n ? next : 0);
      const CAP = 5000; // safety cap
      const limit = Math.min(max, CAP);
      const results = [];
      for (let i = 0; i < limit; i++) {
        try {
          const raw = await contract.getJob(i);
          const parsed = parseJob(raw);
          if (!parsed) continue;
          if (ownerAddress && parsed.client && parsed.client.toLowerCase() !== ownerAddress.toLowerCase()) continue;
          // try to ensure ipfsCID
          try {
            if (!parsed.ipfsCID) {
              const cid = await contract.getJobMetadata(i).catch(() => null);
              parsed.ipfsCID = cid || parsed.ipfsCID;
            }
          } catch { /* ignore */ }
          parsed.metadata = parsed.ipfsCID ? await fetchIPFSMetadata(parsed.ipfsCID).catch(() => null) : null;
          results.push(parsed);
        } catch (e) {
          // skip invalid job ids (getJob may revert)
        }
      }
      results.sort((a, b) => (b.jobId - a.jobId));
      setJobs(results);
      setLoading(false);
      return results;
    } catch (e) {
      console.error('refresh jobs error', e);
      setError(e);
      setJobs([]);
      setLoading(false);
      return [];
    }
  }, [makeProvider, connectContract, parseJob, ownerAddress, fetchIPFSMetadata]);

  // subscribe to events
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const provider = makeProvider();
        const contract = connectContract(provider);

        const onJobCreated = async (jobId, client, ipfsCID, amount, deadline, event) => {
          const id = Number(jobId.toString ? jobId.toString() : jobId);
          try {
            const raw = await contract.getJob(id).catch(() => null);
            const parsed = parseJob(raw) || {
              jobId: id,
              client,
              ipfsCID,
              amount: amount ? BigInt(amount.toString()) : 0n,
              deadline: deadline ? BigInt(deadline.toString()) : 0n,
              status: 0,
            };
            parsed.metadata = parsed.ipfsCID ? await fetchIPFSMetadata(parsed.ipfsCID).catch(() => null) : null;
            setJobs(prev => {
              if (!prev) return [parsed];
              if (prev.some(j => j.jobId === parsed.jobId)) return prev;
              return [parsed, ...prev];
            });
          } catch (e) {
            console.warn('onJobCreated fail', e);
          }
        };

        const onWorkSubmitted = (jobId, submission) => {
          const id = Number(jobId.toString ? jobId.toString() : jobId);
          setJobs(prev => (prev || []).map(j => (j.jobId === id ? { ...j, submission, status: 2 } : j)));
        };

        const onJobAccepted = (jobId, developer) => {
          const id = Number(jobId.toString ? jobId.toString() : jobId);
          setJobs(prev => (prev || []).map(j => (j.jobId === id ? { ...j, developer, status: 1 } : j)));
        };

        const onPartial = (jobId, developer, paidToDeveloper, refundedToClient) => {
          const id = Number(jobId.toString ? jobId.toString() : jobId);
          setJobs(prev => (prev || []).map(j => (j.jobId === id ? { ...j, status: 3 } : j)));
        };

        const onFull = (jobId, developer, amount) => {
          const id = Number(jobId.toString ? jobId.toString() : jobId);
          setJobs(prev => (prev || []).map(j => (j.jobId === id ? { ...j, status: 4 } : j)));
        };

        const onCancelled = (jobId, refundedToClient) => {
          const id = Number(jobId.toString ? jobId.toString() : jobId);
          setJobs(prev => (prev || []).map(j => (j.jobId === id ? { ...j, status: 5 } : j)));
        };

        if (contract.on) {
          contract.on('JobCreated', onJobCreated);
          contract.on('WorkSubmitted', onWorkSubmitted);
          contract.on('JobAccepted', onJobAccepted);
          contract.on('PartialPaymentReleased', onPartial);
          contract.on('FullPaymentReleased', onFull);
          contract.on('JobCancelled', onCancelled);

          cleanupRef.current = () => {
            try {
              contract.off('JobCreated', onJobCreated);
              contract.off('WorkSubmitted', onWorkSubmitted);
              contract.off('JobAccepted', onJobAccepted);
              contract.off('PartialPaymentReleased', onPartial);
              contract.off('FullPaymentReleased', onFull);
              contract.off('JobCancelled', onCancelled);
            } catch (e) { /* ignore */ }
          };
        }
      } catch (e) {
        console.warn('subscribe error', e);
      }
    })();

    return () => {
      if (cleanupRef.current) cleanupRef.current();
    };
  }, [makeProvider, connectContract, parseJob, fetchIPFSMetadata]);

  return { jobs, loading, error, refresh, setJobs };
}
