// src/hooks/useOnchainJobs.js
import { useCallback, useEffect, useRef, useState } from 'react';
import { ethers } from 'ethers';
import abi from '../contracts/devlance.abi.json';

export const JobStatus = {
  Open: 0,
  InProgress: 1,
  Submitted: 2,
  Completed: 3,
  Cancelled: 4,
};

export const StatusLabels = {
  [JobStatus.Open]: 'Open',
  [JobStatus.InProgress]: 'In Progress',
  [JobStatus.Submitted]: 'Submitted',
  [JobStatus.Completed]: 'Completed',
  [JobStatus.Cancelled]: 'Cancelled',
};

export default function useOnchainJobs({ ownerAddress, filterByDeveloper } = {}) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const contractAddress = import.meta.env.VITE_ESCROW_CONTRACT_ADDRESS;
  const ipfsGateway = import.meta.env.VITE_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/';

  const contractRef = useRef(null);
  const providerRef = useRef(null);
  const cleanupRef = useRef(null);

  const makeProvider = useCallback(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      providerRef.current = new ethers.BrowserProvider(window.ethereum);
      return providerRef.current;
    }
    providerRef.current = new ethers.JsonRpcProvider('https://rpc.sepolia.org');
    return providerRef.current;
  }, []);

  const connectContract = useCallback((provider) => {
    if (!contractAddress) throw new Error('Missing VITE_ESCROW_CONTRACT_ADDRESS');
    contractRef.current = new ethers.Contract(contractAddress, abi, provider);
    return contractRef.current;
  }, [contractAddress]);

  const parseJob = useCallback((raw) => {
    if (!raw) return null;
    const id = raw.id ?? raw[0];
    const client = raw.client ?? raw[1];
    const developer = raw.developer ?? raw[2];
    const amount = raw.amount ?? raw[3];
    const securityHold = raw.securityHold ?? raw[4];
    const originalAmount = raw.originalAmount ?? raw[5];
    const ipfsCID = raw.ipfsCID ?? raw[6];
    const submission = raw.submission ?? raw[7];
    const deadline = raw.deadline ?? raw[8];
    const status = raw.status ?? raw[9];

    return {
      jobId: Number(id?.toString?.() ?? id ?? -1),
      client: client ?? ethers.ZeroAddress,
      developer: developer ?? ethers.ZeroAddress,
      amount: amount ? BigInt(amount.toString()) : 0n,
      securityHold: securityHold ? BigInt(securityHold.toString()) : 0n,
      originalAmount: originalAmount ? BigInt(originalAmount.toString()) : 0n,
      ipfsCID: ipfsCID ?? '',
      submission: submission ?? '',
      deadline: deadline ? BigInt(deadline.toString()) : 0n,
      status: Number(status?.toString?.() ?? status ?? 0),
    };
  }, []);

  const fetchIPFSMetadata = useCallback(async (cid) => {
    if (!cid) return null;
    const clean = cid.replace(/^ipfs:\/\//, '').replace(/^\/ipfs\//, '');
    if (!clean) return null;
    try {
      const res = await fetch(`${ipfsGateway}${clean}`, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.warn('IPFS fetch failed:', clean, e);
      return null;
    }
  }, [ipfsGateway]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = makeProvider();
      const contract = connectContract(provider);
      
      let nextId = 0n;
      try {
        const n = await contract.nextJobId();
        nextId = BigInt(n.toString());
      } catch (e) { nextId = 0n; }

      const totalJobs = Number(nextId);
      const limit = Math.min(totalJobs, 1000);
      const results = [];

      for (let i = 0; i < limit; i++) {
        try {
          const raw = await contract.getJob(i);
          const parsed = parseJob(raw);
          if (!parsed || parsed.client === ethers.ZeroAddress) continue;

          if (ownerAddress && parsed.client.toLowerCase() !== ownerAddress.toLowerCase()) continue;
          if (filterByDeveloper && parsed.developer.toLowerCase() !== filterByDeveloper.toLowerCase()) continue;

          if (parsed.ipfsCID) {
            parsed.metadata = await fetchIPFSMetadata(parsed.ipfsCID);
          }
          results.push(parsed);
        } catch (e) { /* skip */ }
      }

      results.sort((a, b) => b.jobId - a.jobId);
      setJobs(results);
      setLoading(false);
      return results;
    } catch (e) {
      console.error('Refresh error:', e);
      setError(e);
      setJobs([]);
      setLoading(false);
      return [];
    }
  }, [makeProvider, connectContract, parseJob, ownerAddress, filterByDeveloper, fetchIPFSMetadata]);

  useEffect(() => {
    let mounted = true;

    const setup = async () => {
      try {
        const provider = makeProvider();
        const contract = connectContract(provider);

        const onJobCreated = async (jobId) => {
          if (!mounted) return;
          const id = Number(jobId.toString());
          try {
            const raw = await contract.getJob(id);
            const parsed = parseJob(raw);
            if (parsed?.ipfsCID) parsed.metadata = await fetchIPFSMetadata(parsed.ipfsCID);
            setJobs(prev => {
              if (prev.some(j => j.jobId === id)) return prev;
              return parsed ? [parsed, ...prev] : prev;
            });
          } catch (e) { /* ignore */ }
        };

        const onJobAccepted = (jobId, developer) => {
          if (!mounted) return;
          const id = Number(jobId.toString());
          setJobs(prev => prev.map(j => j.jobId === id ? { ...j, developer, status: JobStatus.InProgress } : j));
        };

        const onWorkSubmitted = (jobId, submission) => {
          if (!mounted) return;
          const id = Number(jobId.toString());
          setJobs(prev => prev.map(j => j.jobId === id ? { ...j, submission, status: JobStatus.Submitted } : j));
        };

        const onFullPaymentReleased = (jobId) => {
          if (!mounted) return;
          const id = Number(jobId.toString());
          setJobs(prev => prev.map(j => j.jobId === id ? { ...j, status: JobStatus.Completed, amount: 0n, securityHold: 0n } : j));
        };

        const onPartialPaymentReleased = (jobId) => {
          if (!mounted) return;
          const id = Number(jobId.toString());
          setJobs(prev => prev.map(j => j.jobId === id ? { ...j, status: JobStatus.Cancelled, amount: 0n, securityHold: 0n } : j));
        };

        const onJobCancelled = (jobId) => {
          if (!mounted) return;
          const id = Number(jobId.toString());
          setJobs(prev => prev.map(j => j.jobId === id ? { ...j, status: JobStatus.Cancelled, amount: 0n, securityHold: 0n } : j));
        };

        contract.on('JobCreated', onJobCreated);
        contract.on('JobAccepted', onJobAccepted);
        contract.on('WorkSubmitted', onWorkSubmitted);
        contract.on('FullPaymentReleased', onFullPaymentReleased);
        contract.on('PartialPaymentReleased', onPartialPaymentReleased);
        contract.on('JobCancelled', onJobCancelled);

        cleanupRef.current = () => {
          contract.off('JobCreated', onJobCreated);
          contract.off('JobAccepted', onJobAccepted);
          contract.off('WorkSubmitted', onWorkSubmitted);
          contract.off('FullPaymentReleased', onFullPaymentReleased);
          contract.off('PartialPaymentReleased', onPartialPaymentReleased);
          contract.off('JobCancelled', onJobCancelled);
        };
      } catch (e) { console.warn('Event setup error:', e); }
    };

    setup();
    return () => {
      mounted = false;
      cleanupRef.current?.();
    };
  }, [makeProvider, connectContract, parseJob, fetchIPFSMetadata]);

  return { jobs, loading, error, refresh, setJobs, JobStatus, StatusLabels };
}