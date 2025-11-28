// src/pages/CreateGig.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pinMetadataJSON } from '../utils/ipfs';
import { createGigOnchain } from '../utils/contract';
import { isEthereumAvailable, requestAccounts } from '../utils/wallet';

const SECURITY_HOLD_PERCENT = 0.05; // 5% hold (configurable)
const MIN_AMOUNT_ETH = 0.001;
const MAX_AMOUNT_ETH = 1000;
const MIN_DEADLINE_DAYS = 1;
const MAX_DEADLINE_DAYS = 365;

function ethToWeiBN(ethStr) {
  // simple conversion using ethers BigNumber via dynamic import to avoid top-level dependency in this file
  const { ethers } = require('ethers');
  try {
    return ethers.utils.parseEther(String(ethStr));
  } catch (e) {
    throw new Error('Invalid ETH amount');
  }
}

export default function CreateGig() {
  const navigate = useNavigate();

  // form fields
  const [title, setTitle] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [amountEth, setAmountEth] = useState('');
  const [deadlineDays, setDeadlineDays] = useState(7);
  const [tags, setTags] = useState('');
  const [inviteAddress, setInviteAddress] = useState('');
  const [deliverableChecklist, setDeliverableChecklist] = useState('');
  const [sampleFiles, setSampleFiles] = useState([]);

  // runtime states
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [txStatus, setTxStatus] = useState(null); // null | 'pending' | 'confirmed' | 'failed'
  const [error, setError] = useState(null);
  const [pinnedCID, setPinnedCID] = useState(null);

  // helper: validation
  function validateForm() {
    if (!title.trim()) return 'Title is required';
    if (!shortDesc.trim()) return 'Short description is required';
    const amount = Number(amountEth);
    if (!amount || Number.isNaN(amount)) return 'Amount must be a number';
    if (amount < MIN_AMOUNT_ETH) return `Amount must be at least ${MIN_AMOUNT_ETH} ETH`;
    if (amount > MAX_AMOUNT_ETH) return `Amount must be less than ${MAX_AMOUNT_ETH} ETH`;
    const days = Number(deadlineDays);
    if (!days || isNaN(days) || days < MIN_DEADLINE_DAYS || days > MAX_DEADLINE_DAYS)
      return `Deadline must be between ${MIN_DEADLINE_DAYS} and ${MAX_DEADLINE_DAYS} days`;
    // optional: validate inviteAddress if provided (basic length)
    if (inviteAddress && !/^0x[a-fA-F0-9]{40}$/.test(inviteAddress)) return 'Invite wallet address is invalid';
    return null;
  }

  function handleFilesChange(e) {
    setSampleFiles(Array.from(e.target.files || []));
  }

  // compute security hold (BigNumber string)
  function computeSecurityHoldWei(amountEthStr) {
    const { ethers } = require('ethers');
    const amountWei = ethers.utils.parseEther(String(amountEthStr)); // BigNumber
    const hold = amountWei.mul(Math.floor(SECURITY_HOLD_PERCENT * 100)).div(100); // percent math
    return hold; // BigNumber
  }

  async function handleCreateClick() {
    setError(null);
    setTxHash(null);
    setTxStatus(null);

    const validation = validateForm();
    if (validation) {
      setError(validation);
      return;
    }

    // Ensure wallet present
    if (!isEthereumAvailable()) {
      setError('MetaMask (or injected wallet) not found. Please install or use another browser.');
      return;
    }

    setLoading(true);
    try {
      // 1) Pin metadata to IPFS first — required
      const metadata = {
        title,
        shortDesc,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        inviteAddress: inviteAddress || null,
        deliverableChecklist,
        sampleFiles: sampleFiles.map((f) => ({ name: f.name, size: f.size })), // files not uploaded here; optional
        createdAt: new Date().toISOString(),
      };

      const pinRes = await pinMetadataJSON(metadata);
      // expects { hash }
      if (!pinRes || !pinRes.hash) {
        throw new Error('Pinning failed — aborting create');
      }
      setPinnedCID(pinRes.hash);

      // 2) Prepare values
      const { ethers } = require('ethers');
      const amountWeiBN = ethers.utils.parseEther(String(amountEth)); // BigNumber
      const holdWeiBN = computeSecurityHoldWei(amountEth); // BigNumber
      const totalValueBN = amountWeiBN.add(holdWeiBN);

      // Show exact amounts to user before prompting wallet confirm
      // (In UI we just proceed to create and MetaMask will show the value)
      const previewMsg = `You are about to create a gig that locks ${ethers.utils.formatEther(
        amountWeiBN
      )} ETH plus a security hold of ${ethers.utils.formatEther(holdWeiBN)} ETH (total ${ethers.utils.formatEther(
        totalValueBN
      )} ETH).`;

      // optional: confirm in browser (simple)
      // you can replace this with a nicer modal; keep simple here
      const ok = window.confirm(previewMsg + '\n\nProceed to wallet to confirm?');
      if (!ok) {
        setLoading(false);
        return;
      }

      // 3) Ensure accounts connected (this will prompt MetaMask to choose account)
      await requestAccounts();

      // 4) Send on-chain tx using ethers helper (createGig)
      setTxStatus('pending');
      const txResp = await createGigOnchain({
        ipfsCID: pinRes.hash,
        amountWei: amountWeiBN.toString(),
        deadlineDays: Number(deadlineDays),
        valueWei: totalValueBN.toString(),
      });

      setTxHash(txResp.hash);
      setTxStatus('pending');

      // 5) Optimistic UI: show link to explorer (if provided)
      // Wait for confirmation
      const receipt = await txResp.wait(1); // wait for 1 confirmation
      if (receipt && receipt.status === 1) {
        setTxStatus('confirmed');
        // After confirmation you can show Gig card with status Open and link to tx
        // Optionally you could parse event logs to get gigId from GigCreated event
      } else {
        setTxStatus('failed');
        setError('Transaction failed on-chain (status != 1)');
      }
    } catch (e) {
      console.error(e);
      setError(e.message || String(e));
      setTxStatus('failed');
    } finally {
      setLoading(false);
    }
  }

  const explorerBase = import.meta.env.VITE_EXPLORER_TX_URL || ''; // e.g. https://sepolia.etherscan.io/tx/

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h2 className="text-2xl font-semibold mb-4">Create Gig</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 border rounded" placeholder="Short title" />
        </div>

        <div>
          <label className="block text-sm font-medium">Short description</label>
          <textarea value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} className="w-full p-2 border rounded" rows="4" />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium">Amount (ETH)</label>
            <input value={amountEth} onChange={(e) => setAmountEth(e.target.value)} className="w-full p-2 border rounded" placeholder="e.g. 0.5" />
          </div>

          <div>
            <label className="block text-sm font-medium">Deadline (days)</label>
            <input type="number" value={deadlineDays} min={MIN_DEADLINE_DAYS} max={MAX_DEADLINE_DAYS} onChange={(e) => setDeadlineDays(e.target.value)} className="w-full p-2 border rounded" />
          </div>

          <div>
            <label className="block text-sm font-medium">Tags (comma)</label>
            <input value={tags} onChange={(e) => setTags(e.target.value)} className="w-full p-2 border rounded" placeholder="web3, solidity" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Invite wallet address (optional)</label>
          <input value={inviteAddress} onChange={(e) => setInviteAddress(e.target.value)} className="w-full p-2 border rounded" placeholder="0x..." />
        </div>

        <div>
          <label className="block text-sm font-medium">Deliverable checklist (text)</label>
          <textarea value={deliverableChecklist} onChange={(e) => setDeliverableChecklist(e.target.value)} className="w-full p-2 border rounded" rows="3" placeholder="List deliverables line by line" />
        </div>

        <div>
          <label className="block text-sm font-medium">Sample files (optional, small)</label>
          <input type="file" multiple onChange={handleFilesChange} />
          <div className="text-sm text-gray-500 mt-1">Files will be included as metadata file list; actual file pinning must be handled by backend or by you using pinning service.</div>
        </div>

        <div className="flex gap-3 items-center">
          <button onClick={handleCreateClick} className="px-4 py-2 rounded bg-blue-600 text-white" disabled={loading}>
            {loading ? 'Creating…' : 'Connect Wallet → Create & Lock Payment'}
          </button>
          <button onClick={() => navigate('/')} className="px-3 py-2 rounded border">Cancel</button>
        </div>

        {pinnedCID && (
          <div className="mt-2 text-sm">
            Metadata pinned: <span className="font-mono">{pinnedCID}</span>
          </div>
        )}

        {txHash && (
          <div className="mt-4 p-3 border rounded bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Transaction</div>
                <div className="font-mono">{txHash}</div>
                {explorerBase ? (
                  <a className="text-sm text-blue-600 underline" href={`${explorerBase}${txHash}`} target="_blank" rel="noreferrer">View on explorer</a>
                ) : (
                  <div className="text-sm text-gray-500">Explorer link not configured</div>
                )}
              </div>

              <div>
                {txStatus === 'pending' && <div className="text-yellow-700">Creating… (waiting confirmation)</div>}
                {txStatus === 'confirmed' && <div className="text-green-600">Gig Open — confirmed</div>}
                {txStatus === 'failed' && <div className="text-red-600">Transaction failed</div>}
              </div>
            </div>
          </div>
        )}

        {error && <div className="text-red-600 mt-2">{error}</div>}
      </div>
    </div>
  );
}
