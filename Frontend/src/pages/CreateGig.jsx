// src/pages/CreateGig.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pinMetadataJSON } from '../utils/ipfs';
import { createGigOnchain } from '../utils/contract';
import { isEthereumAvailable, requestAccounts } from '../utils/wallet';
import { ethers } from 'ethers';

const SECURITY_HOLD_BPS = 500;
const BASIS_POINTS = 10000;
const MIN_AMOUNT_ETH = 0.001;
const MAX_AMOUNT_ETH = 1000;
const MIN_DEADLINE_DAYS = 1;
const MAX_DEADLINE_DAYS = 365;

export default function CreateGig() {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [amountEth, setAmountEth] = useState('');
  const [deadlineDays, setDeadlineDays] = useState(7);
  const [tags, setTags] = useState('');
  const [inviteAddress, setInviteAddress] = useState('');
  const [deliverableChecklist, setDeliverableChecklist] = useState('');
  const [sampleFiles, setSampleFiles] = useState([]);

  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [txStatus, setTxStatus] = useState(null);
  const [error, setError] = useState(null);
  const [pinnedCID, setPinnedCID] = useState(null);

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
    if (inviteAddress && !/^0x[a-fA-F0-9]{40}$/.test(inviteAddress)) return 'Invite wallet address is invalid';
    return null;
  }

  function handleFilesChange(e) {
    setSampleFiles(Array.from(e.target.files || []));
  }

  function computeSecurityHoldWei(amountEthStr) {
    try {
      const amountWei = ethers.parseEther(String(amountEthStr || '0'));
      const holdWei = (amountWei * BigInt(SECURITY_HOLD_BPS)) / BigInt(BASIS_POINTS);
      return holdWei;
    } catch (err) {
      return 0n;
    }
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

    if (!isEthereumAvailable()) {
      setError('MetaMask (or injected wallet) not found.');
      return;
    }

    setLoading(true);
    try {
      const metadata = {
        title,
        shortDesc,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        inviteAddress: inviteAddress || null,
        deliverableChecklist,
        sampleFiles: sampleFiles.map(f => ({ name: f.name, size: f.size })),
        createdAt: new Date().toISOString(),
      };

      const pinRes = await pinMetadataJSON(metadata);
      if (!pinRes || !pinRes.hash) throw new Error('Pinning failed — aborting create');
      setPinnedCID(pinRes.hash);

      const amountWei = ethers.parseEther(String(amountEth));
      const holdWei = computeSecurityHoldWei(amountEth);
      const totalValue = amountWei + holdWei;

      const previewMsg = `You are about to create a gig that locks ${ethers.formatEther(
        amountWei
      )} ETH plus a security hold of ${ethers.formatEther(holdWei)} ETH (total ${ethers.formatEther(
        totalValue
      )} ETH). Proceed to the wallet to confirm.`;
      const ok = window.confirm(previewMsg);
      if (!ok) {
        setLoading(false);
        return;
      }

      await requestAccounts();

      setTxStatus('pending');

      const txResp = await createGigOnchain({
        ipfsCID: pinRes.hash,
        amountWei: amountWei.toString(),
        deadlineDays: Number(deadlineDays),
        valueWei: totalValue.toString(),
      });

      setTxHash(txResp.hash);
      setTxStatus('pending');

      const receipt = await txResp.wait(1);

      if (receipt && receipt.status === 1) {
        setTxStatus('confirmed');
        navigate('/dashboard');
      } else {
        setTxStatus('failed');
        setError('Transaction failed on-chain (status != 1)');
      }
    } catch (e) {
      console.error(e);
      if (e?.data?.message) setError(e.data.message);
      else if (e?.error?.message) setError(e.error.message);
      else setError(e?.message || String(e));
      setTxStatus('failed');
    } finally {
      setLoading(false);
    }
  }

  const explorerBase = import.meta.env.VITE_EXPLORER_TX_URL || '';

  const securityHold = () => {
    try {
      if (!amountEth || Number(amountEth) === 0) return '0 ETH';
      const hold = computeSecurityHoldWei(amountEth);
      return `${ethers.formatEther(hold)} ETH`;
    } catch {
      return '0 ETH';
    }
  };
  const totalRequired = () => {
    try {
      if (!amountEth || Number(amountEth) === 0) return '0 ETH';
      const amountWei = ethers.parseEther(String(amountEth));
      const hold = computeSecurityHoldWei(amountEth);
      return `${ethers.formatEther(amountWei + hold)} ETH`;
    } catch {
      return '0 ETH';
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#090912]">
      
      {/* Animated Gradient Mesh Background */}
      <div aria-hidden className="absolute inset-0 -z-20">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/20 via-purple-800/10 to-blue-900/20 blur-3xl opacity-60 animate-bgPulse"></div>
        <div className="absolute top-1/4 -left-20 w-[40rem] h-[40rem] rounded-full bg-indigo-600/25 blur-[140px] opacity-50 animate-float-slow" />
        <div className="absolute bottom-1/4 right-0 w-[35rem] h-[35rem] rounded-full bg-purple-600/25 blur-[140px] opacity-50 animate-float-reverse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] rounded-full bg-violet-600/20 blur-[160px] opacity-40 animate-pulse-slow" />
      </div>

      {/* Floating particles/orbs */}
      <div aria-hidden className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[10%] left-[15%] w-32 h-32 rounded-full bg-indigo-500/10 blur-2xl animate-float-slow" />
        <div className="absolute top-[60%] right-[20%] w-40 h-40 rounded-full bg-purple-500/10 blur-2xl animate-float-reverse" />
        <div className="absolute bottom-[20%] left-[40%] w-36 h-36 rounded-full bg-violet-500/10 blur-2xl animate-pulse-slow" />
      </div>

      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&family=Inter:wght@400;500;600&display=swap');

          * {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
          }

          @keyframes bgPulse {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 0.7; }
          }
          .animate-bgPulse { animation: bgPulse 10s ease-in-out infinite; }

          @keyframes float-slow {
            0%, 100% { transform: translate(0, 0); }
            50% { transform: translate(30px, -30px); }
          }
          .animate-float-slow { animation: float-slow 20s ease-in-out infinite; }

          @keyframes float-reverse {
            0%, 100% { transform: translate(0, 0); }
            50% { transform: translate(-30px, 30px); }
          }
          .animate-float-reverse { animation: float-reverse 18s ease-in-out infinite; }

          @keyframes pulse-slow {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.1); }
          }
          .animate-pulse-slow { animation: pulse-slow 15s ease-in-out infinite; }

          .glass-card {
            background: rgba(10, 10, 20, 0.5);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4),
                        inset 0 1px 0 rgba(255, 255, 255, 0.05);
          }

          .glass-input {
            background: rgba(15, 15, 25, 0.6);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.3s ease;
          }

          .glass-input:focus {
            background: rgba(20, 20, 30, 0.7);
            border-color: rgba(139, 92, 246, 0.4);
            outline: none;
            box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1),
                        0 0 20px rgba(139, 92, 246, 0.2);
          }

          .btn-primary {
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(139, 92, 246, 0.3));
            backdrop-filter: blur(16px);
            border: 2px solid rgba(139, 92, 246, 0.4);
            box-shadow: 0 8px 32px rgba(99, 102, 241, 0.3),
                        inset 0 1px 0 rgba(255, 255, 255, 0.1);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .btn-primary:hover:not(:disabled) {
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.4), rgba(139, 92, 246, 0.4));
            border-color: rgba(167, 139, 250, 0.6);
            transform: translateY(-2px);
            box-shadow: 0 12px 48px rgba(99, 102, 241, 0.4),
                        inset 0 1px 0 rgba(255, 255, 255, 0.15);
          }

          .btn-primary:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .btn-secondary {
            background: rgba(20, 20, 30, 0.4);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.15);
            transition: all 0.3s ease;
          }

          .btn-secondary:hover {
            background: rgba(30, 30, 45, 0.6);
            border-color: rgba(255, 255, 255, 0.25);
            transform: translateY(-2px);
          }

          .section-title {
            font-family: 'Poppins', sans-serif;
            font-weight: 700;
          }
        `}
      </style>

      <div className="relative z-10 min-h-screen py-12 px-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="section-title text-4xl md:text-5xl text-white mb-3"
                style={{ textShadow: '0 2px 30px rgba(0, 0, 0, 0.8)' }}>
              Create a Gig
            </h1>
            <p className="text-gray-300 text-lg"
               style={{ textShadow: '0 2px 20px rgba(0, 0, 0, 0.7)' }}>
              Secure escrow • IPFS pinned • 5% security hold
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Basic Info Card */}
              <div className="glass-card rounded-2xl p-8">
                <h2 className="text-xl font-bold text-white mb-6">Basic Information</h2>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                    <input 
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)} 
                      placeholder="Short, punchy title" 
                      className="glass-input w-full p-4 rounded-xl text-white placeholder-gray-500" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                    <textarea 
                      value={shortDesc} 
                      onChange={(e) => setShortDesc(e.target.value)} 
                      rows={5} 
                      placeholder="Describe the task in detail" 
                      className="glass-input w-full p-4 rounded-xl text-white placeholder-gray-500 resize-none" 
                    />
                  </div>
                </div>
              </div>

              {/* Payment & Timeline Card */}
              <div className="glass-card rounded-2xl p-8">
                <h2 className="text-xl font-bold text-white mb-6">Payment & Timeline</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Amount (ETH)</label>
                    <input 
                      value={amountEth} 
                      onChange={(e) => setAmountEth(e.target.value)} 
                      placeholder="e.g. 0.5" 
                      className="glass-input w-full p-4 rounded-xl text-white placeholder-gray-500" 
                    />
                    <div className="text-xs text-gray-400 mt-2">
                      Min {MIN_AMOUNT_ETH} • Max {MAX_AMOUNT_ETH} ETH
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Deadline (days)</label>
                    <input 
                      type="number" 
                      value={deadlineDays} 
                      min={MIN_DEADLINE_DAYS} 
                      max={MAX_DEADLINE_DAYS} 
                      onChange={(e) => setDeadlineDays(e.target.value)} 
                      className="glass-input w-full p-4 rounded-xl text-white placeholder-gray-500" 
                    />
                    <div className="text-xs text-gray-400 mt-2">
                      {MIN_DEADLINE_DAYS}-{MAX_DEADLINE_DAYS} days
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Details Card */}
              <div className="glass-card rounded-2xl p-8">
                <h2 className="text-xl font-bold text-white mb-6">Additional Details</h2>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Tags (comma-separated)</label>
                    <input 
                      value={tags} 
                      onChange={(e) => setTags(e.target.value)} 
                      placeholder="web3, solidity, smart contracts" 
                      className="glass-input w-full p-4 rounded-xl text-white placeholder-gray-500" 
                    />
                    <div className="text-xs text-gray-400 mt-2">
                      Up to 8 tags — helps developers find your gig
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Invite Wallet Address <span className="text-gray-500">(optional)</span>
                    </label>
                    <input 
                      value={inviteAddress} 
                      onChange={(e) => setInviteAddress(e.target.value)} 
                      placeholder="0x..." 
                      className="glass-input w-full p-4 rounded-xl text-white placeholder-gray-500 font-mono text-sm" 
                    />
                    <div className="text-xs text-gray-400 mt-2">
                      Stored in IPFS metadata only
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Deliverable Checklist</label>
                    <textarea 
                      value={deliverableChecklist} 
                      onChange={(e) => setDeliverableChecklist(e.target.value)} 
                      rows={4} 
                      placeholder="List deliverables, one per line" 
                      className="glass-input w-full p-4 rounded-xl text-white placeholder-gray-500 resize-none" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Sample Files <span className="text-gray-500">(optional)</span>
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="btn-primary px-6 py-3 rounded-xl font-semibold text-white cursor-pointer inline-block">
                        <input type="file" multiple onChange={handleFilesChange} className="sr-only" />
                        Choose Files
                      </label>
                      <div className="text-sm text-gray-300">
                        {sampleFiles.length > 0 ? (
                          <span className="font-medium">{sampleFiles.length} file{sampleFiles.length !== 1 ? 's' : ''} selected</span>
                        ) : (
                          <span className="text-gray-500">No files selected</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-4">
                <button 
                  onClick={() => navigate(-1)} 
                  className="btn-secondary px-8 py-4 rounded-xl font-semibold text-gray-200"
                >
                  Cancel
                </button>

                <button 
                  onClick={handleCreateClick} 
                  disabled={loading} 
                  className="btn-primary px-8 py-4 rounded-xl font-bold text-white"
                >
                  {loading ? 'Creating Gig...' : 'Create & Lock Funds'}
                </button>
              </div>

              {/* Status Messages */}
              {pinnedCID && (
                <div className="glass-card rounded-xl p-4">
                  <div className="text-sm text-gray-300">
                    <span className="text-emerald-400 font-semibold">✓</span> Metadata pinned to IPFS
                  </div>
                  <div className="font-mono text-xs text-gray-400 mt-1 break-all">{pinnedCID}</div>
                </div>
              )}

              {txHash && (
                <div className="glass-card rounded-xl p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-300 mb-2">Transaction Hash</div>
                      <div className="font-mono text-sm text-white break-all mb-3">{txHash}</div>
                      {explorerBase && (
                        <a 
                          className="text-sm text-indigo-400 hover:text-indigo-300 underline" 
                          href={`${explorerBase}${txHash}`} 
                          target="_blank" 
                          rel="noreferrer"
                        >
                          View on Explorer →
                        </a>
                      )}
                    </div>

                    <div className="text-right">
                      {txStatus === 'pending' && (
                        <div className="text-yellow-400 font-medium text-sm">
                          ⏳ Pending...
                        </div>
                      )}
                      {txStatus === 'confirmed' && (
                        <div className="text-emerald-400 font-medium text-sm">
                          ✓ Confirmed
                        </div>
                      )}
                      {txStatus === 'failed' && (
                        <div className="text-red-400 font-medium text-sm">
                          ✗ Failed
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="glass-card rounded-xl p-4 border-red-500/30">
                  <div className="text-red-400 text-sm font-medium">
                    ⚠ {error}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              
              {/* Summary Card */}
              <div className="glass-card rounded-2xl p-6 sticky top-6">
                <h3 className="text-lg font-bold text-white mb-5">Gig Summary</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Payment Amount</span>
                    <span className="text-lg font-bold text-white">
                      {(Number(amountEth) || 0).toLocaleString(undefined, {maximumFractionDigits:6})} ETH
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Security Hold (5%)</span>
                    <span className="text-base font-semibold text-gray-300">
                      {securityHold()}
                    </span>
                  </div>

                  <div className="h-px bg-white/10 my-3" />

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-300">Total Required</span>
                    <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                      {totalRequired()}
                    </span>
                  </div>

                  <div className="h-px bg-white/10 my-4" />

                  <div>
                    <div className="text-xs text-gray-400 mb-1">Deadline</div>
                    <div className="text-sm text-white font-medium">
                      {deadlineDays} days
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Due: {new Date(Date.now() + Number(deadlineDays) * 24*60*60*1000).toLocaleDateString()}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-400 mb-1">Tags</div>
                    <div className="text-sm text-gray-300">
                      {tags ? tags.split(',').map(t=>t.trim()).filter(Boolean).join(', ') : 'No tags'}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-400 mb-1">Files Attached</div>
                    <div className="text-sm text-gray-300">
                      {sampleFiles.length} file{sampleFiles.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips Card */}
              <div className="glass-card rounded-2xl p-6">
                <h4 className="text-base font-bold text-white mb-4">💡 Pro Tips</h4>
                <ul className="space-y-3 text-sm text-gray-300">
                  <li className="flex gap-2">
                    <span className="text-purple-400">•</span>
                    <span>Be explicit in deliverables for faster approval</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-purple-400">•</span>
                    <span>Use relevant tags to make your gig discoverable</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-purple-400">•</span>
                    <span>Keep large files external — add links in checklist</span>
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

// // src/pages/CreateGig.jsx
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { pinMetadataJSON } from '../utils/ipfs';
// import { createGigOnchain } from '../utils/contract';
// import { isEthereumAvailable, requestAccounts } from '../utils/wallet';
// import { ethers } from 'ethers';

// const SECURITY_HOLD_BPS = 500;
// const BASIS_POINTS = 10000;
// const MIN_AMOUNT_ETH = 0.001;
// const MAX_AMOUNT_ETH = 1000;
// const MIN_DEADLINE_DAYS = 1;
// const MAX_DEADLINE_DAYS = 365;

// export default function CreateGig() {
//   const navigate = useNavigate();

//   const [title, setTitle] = useState('');
//   const [shortDesc, setShortDesc] = useState('');
//   const [amountEth, setAmountEth] = useState('');
//   const [deadlineDays, setDeadlineDays] = useState(7);
//   const [tags, setTags] = useState('');
//   const [inviteAddress, setInviteAddress] = useState('');
//   const [deliverableChecklist, setDeliverableChecklist] = useState('');
//   const [sampleFiles, setSampleFiles] = useState([]);

//   const [loading, setLoading] = useState(false);
//   const [txHash, setTxHash] = useState(null);
//   const [txStatus, setTxStatus] = useState(null);
//   const [error, setError] = useState(null);
//   const [pinnedCID, setPinnedCID] = useState(null);

//   function validateForm() {
//     if (!title.trim()) return 'Title is required';
//     if (!shortDesc.trim()) return 'Short description is required';
//     const amount = Number(amountEth);
//     if (!amount || Number.isNaN(amount)) return 'Amount must be a number';
//     if (amount < MIN_AMOUNT_ETH) return `Amount must be at least ${MIN_AMOUNT_ETH} ETH`;
//     if (amount > MAX_AMOUNT_ETH) return `Amount must be less than ${MAX_AMOUNT_ETH} ETH`;
//     const days = Number(deadlineDays);
//     if (!days || isNaN(days) || days < MIN_DEADLINE_DAYS || days > MAX_DEADLINE_DAYS)
//       return `Deadline must be between ${MIN_DEADLINE_DAYS} and ${MAX_DEADLINE_DAYS} days`;
//     if (inviteAddress && !/^0x[a-fA-F0-9]{40}$/.test(inviteAddress)) return 'Invite wallet address is invalid';
//     return null;
//   }

//   function handleFilesChange(e) {
//     setSampleFiles(Array.from(e.target.files || []));
//   }

//   function computeSecurityHoldWei(amountEthStr) {
//     try {
//       const amountWei = ethers.parseEther(String(amountEthStr || '0'));
//       const holdWei = (amountWei * BigInt(SECURITY_HOLD_BPS)) / BigInt(BASIS_POINTS);
//       return holdWei;
//     } catch (err) {
//       return 0n;
//     }
//   }

//   async function handleCreateClick() {
//     setError(null);
//     setTxHash(null);
//     setTxStatus(null);

//     const validation = validateForm();
//     if (validation) {
//       setError(validation);
//       return;
//     }

//     if (!isEthereumAvailable()) {
//       setError('MetaMask (or injected wallet) not found.');
//       return;
//     }

//     setLoading(true);
//     try {
//       const metadata = {
//         title,
//         shortDesc,
//         tags: tags.split(',').map(t => t.trim()).filter(Boolean),
//         inviteAddress: inviteAddress || null,
//         deliverableChecklist,
//         sampleFiles: sampleFiles.map(f => ({ name: f.name, size: f.size })),
//         createdAt: new Date().toISOString(),
//       };

//       const pinRes = await pinMetadataJSON(metadata);
//       if (!pinRes || !pinRes.hash) throw new Error('Pinning failed — aborting create');
//       setPinnedCID(pinRes.hash);

//       const amountWei = ethers.parseEther(String(amountEth));
//       const holdWei = computeSecurityHoldWei(amountEth);
//       const totalValue = amountWei + holdWei;

//       const previewMsg = `You are about to create a gig that locks ${ethers.formatEther(
//         amountWei
//       )} ETH plus a security hold of ${ethers.formatEther(holdWei)} ETH (total ${ethers.formatEther(
//         totalValue
//       )} ETH). Proceed to the wallet to confirm.`;
//       const ok = window.confirm(previewMsg);
//       if (!ok) {
//         setLoading(false);
//         return;
//       }

//       await requestAccounts();

//       setTxStatus('pending');

//       const txResp = await createGigOnchain({
//         ipfsCID: pinRes.hash,
//         amountWei: amountWei.toString(),
//         deadlineDays: Number(deadlineDays),
//         valueWei: totalValue.toString(),
//       });

//       setTxHash(txResp.hash);
//       setTxStatus('pending');

//       const receipt = await txResp.wait(1);

//       if (receipt && receipt.status === 1) {
//         setTxStatus('confirmed');

//         // navigate to dashboard (dashboard reads on-chain)
//         navigate('/dashboard');
//       } else {
//         setTxStatus('failed');
//         setError('Transaction failed on-chain (status != 1)');
//       }
//     } catch (e) {
//       console.error(e);
//       if (e?.data?.message) setError(e.data.message);
//       else if (e?.error?.message) setError(e.error.message);
//       else setError(e?.message || String(e));
//       setTxStatus('failed');
//     } finally {
//       setLoading(false);
//     }
//   }

//   const explorerBase = import.meta.env.VITE_EXPLORER_TX_URL || '';

//   const securityHold = () => {
//     try {
//       if (!amountEth || Number(amountEth) === 0) return '0 ETH';
//       const hold = computeSecurityHoldWei(amountEth);
//       return `${ethers.formatEther(hold)} ETH`;
//     } catch {
//       return '0 ETH';
//     }
//   };
//   const totalRequired = () => {
//     try {
//       if (!amountEth || Number(amountEth) === 0) return '0 ETH';
//       const amountWei = ethers.parseEther(String(amountEth));
//       const hold = computeSecurityHoldWei(amountEth);
//       return `${ethers.formatEther(amountWei + hold)} ETH`;
//     } catch {
//       return '0 ETH';
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-[#06060a] to-[#04050a] text-gray-200 py-12">
//       <div className="max-w-7xl mx-auto px-6">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           <div className="lg:col-span-2">
//             <div className="rounded-2xl bg-gradient-to-b from-[#07121a]/60 to-[#07121a]/30 border border-white/6 p-8 shadow-[0_8px_40px_rgba(2,6,23,0.7)]">
//               <div className="flex items-center justify-between">
//                 <h2 className="text-3xl font-extrabold text-white">Create a Gig</h2>
//                 <div className="text-sm text-gray-400">Secure escrow • IPFS pinned • 5% hold</div>
//               </div>

//               <div className="mt-6 space-y-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-300">Title</label>
//                   <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Short, punchy title" className="mt-2 w-full p-4 rounded-lg bg-[#06101a] border border-white/6 placeholder-gray-500 text-white focus:ring-0" />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-300">Short description</label>
//                   <textarea value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} rows={5} placeholder="Describe the task" className="mt-2 w-full p-4 rounded-lg bg-[#06101a] border border-white/6 placeholder-gray-500 text-white focus:ring-0 resize-none" />
//                 </div>

//                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-300">Amount (ETH)</label>
//                     <input value={amountEth} onChange={(e) => setAmountEth(e.target.value)} placeholder="e.g. 0.5" className="mt-2 w-full p-3 rounded-lg bg-[#06101a] border border-white/6 placeholder-gray-500 text-white focus:ring-0" />
//                     <div className="text-xs text-gray-500 mt-2">Min {MIN_AMOUNT_ETH} • Max {MAX_AMOUNT_ETH}</div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-300">Deadline (days)</label>
//                     <input type="number" value={deadlineDays} min={MIN_DEADLINE_DAYS} max={MAX_DEADLINE_DAYS} onChange={(e) => setDeadlineDays(e.target.value)} className="mt-2 w-full p-3 rounded-lg bg-[#06101a] border border-white/6 placeholder-gray-500 text-white focus:ring-0" />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-300">Tags (comma)</label>
//                     <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="web3, solidity" className="mt-2 w-full p-3 rounded-lg bg-[#06101a] border border-white/6 placeholder-gray-500 text-white focus:ring-0" />
//                     <div className="text-xs text-gray-500 mt-2">Up to 8 tags — helps devs find your gig.</div>
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-300">Invite wallet address (optional)</label>
//                   <input value={inviteAddress} onChange={(e) => setInviteAddress(e.target.value)} placeholder="0x... (stored in metadata only)" className="mt-2 w-full p-3 rounded-lg bg-[#06101a] border border-white/6 placeholder-gray-500 text-white focus:ring-0" />
//                   <div className="text-xs text-gray-500 mt-2">Invite address is saved in IPFS metadata only.</div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-300">Deliverable checklist</label>
//                   <textarea value={deliverableChecklist} onChange={(e) => setDeliverableChecklist(e.target.value)} rows={4} placeholder="List deliverables, one per line" className="mt-2 w-full p-4 rounded-lg bg-[#06101a] border border-white/6 placeholder-gray-500 text-white focus:ring-0 resize-none" />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-300">Sample files (optional)</label>
//                   <div className="mt-2 flex items-center gap-4">
//                     <label className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-500 text-white cursor-pointer shadow-md">
//                       <input type="file" multiple onChange={handleFilesChange} className="sr-only" />
//                       Upload files
//                     </label>
//                     <div className="text-sm text-gray-400">
//                       Max 10 small files • actual pinning handled separately
//                       <div className="text-xs text-gray-500 mt-1">{sampleFiles.length} files attached</div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="pt-4 border-t border-white/6" />

//                 <div className="flex items-center justify-between gap-4">
//                   <div>
//                     <div className="text-xs text-gray-400">Security hold</div>
//                     <div className="text-lg font-semibold text-white">5% of amount</div>
//                   </div>

//                   <div className="flex items-center gap-3">
//                     <button onClick={handleCreateClick} disabled={loading} className="px-6 py-3 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-500 text-white font-semibold shadow-[0_10px_30px_rgba(124,58,237,0.18)] disabled:opacity-60">
//                       {loading ? 'Creating…' : 'Connect Wallet → Create & Lock'}
//                     </button>

//                     <button onClick={() => navigate(-1)} className="px-4 py-3 rounded-2xl border border-white/6 text-gray-200">
//                       Cancel
//                     </button>
//                   </div>
//                 </div>

//                 {pinnedCID && <div className="mt-4 text-sm text-gray-300">Metadata pinned: <span className="font-mono text-gray-200">{pinnedCID}</span></div>}

//                 {txHash && (
//                   <div className="mt-4 p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-white/6">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <div className="text-sm text-gray-400">Transaction</div>
//                         <div className="font-mono text-sm text-white">{txHash}</div>
//                         {explorerBase ? <a className="text-sm text-indigo-300 underline" href={`${explorerBase}${txHash}`} target="_blank" rel="noreferrer">View on explorer</a> : <div className="text-sm text-gray-500">Explorer link not configured</div>}
//                       </div>

//                       <div>
//                         {txStatus === 'pending' && <div className="text-yellow-400">Creating… (waiting confirmation)</div>}
//                         {txStatus === 'confirmed' && <div className="text-emerald-400">Gig Open — confirmed</div>}
//                         {txStatus === 'failed' && <div className="text-red-500">Transaction failed</div>}
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {error && <div className="mt-3 text-sm text-red-400">{error}</div>}
//               </div>
//             </div>
//           </div>

//           {/* Sidebar */}
//           <aside className="space-y-6">
//             <div className="rounded-2xl bg-gradient-to-b from-[#07121a]/55 to-[#07121a]/25 border border-white/6 p-6">
//               <h3 className="text-lg font-semibold text-white">Gig summary</h3>
//               <div className="mt-4 space-y-3 text-sm text-gray-300">
//                 <div className="flex justify-between"><div>Amount</div><div className="font-medium">{(Number(amountEth) || 0).toLocaleString(undefined, {maximumFractionDigits:6})} ETH</div></div>
//                 <div className="flex justify-between"><div>Security hold (5%)</div><div className="font-medium">{securityHold()}</div></div>
//                 <div className="h-px my-2 bg-white/6" />
//                 <div className="flex justify-between text-sm"><div>Total required</div><div className="text-xl font-semibold text-indigo-300">{totalRequired()}</div></div>
//                 <div className="h-px my-3 bg-white/6" />
//                 <div className="text-xs text-gray-400">Deadline</div>
//                 <div className="text-sm text-gray-200">{deadlineDays} days • by {new Date(Date.now() + Number(deadlineDays) * 24*60*60*1000).toLocaleDateString()}</div>
//                 <div className="mt-3 text-xs text-gray-400">Tags</div>
//                 <div className="text-sm text-gray-200">{tags ? tags.split(',').map(t=>t.trim()).filter(Boolean).join(', ') : 'No tags'}</div>
//                 <div className="mt-3 text-xs text-gray-400">Files attached</div>
//                 <div className="text-sm text-gray-200">{sampleFiles.length} files • {sampleFiles.reduce((s,f)=> s + (f.size||0),0)} B</div>
//               </div>
//             </div>

//             <div className="rounded-2xl bg-gradient-to-b from-[#07121a]/45 to-[#07121a]/18 border border-white/6 p-6">
//               <h4 className="text-sm font-semibold text-white mb-3">Pro tips</h4>
//               <ul className="list-disc list-inside text-sm text-gray-400 space-y-2">
//                 <li>Be explicit in deliverables (makes approval fast).</li>
//                 <li>Use tags to make your gig discoverable.</li>
//                 <li>Keep large files external — add links in checklist.</li>
//               </ul>
//             </div>
//           </aside>
//         </div>
//       </div>
//     </div>
//   );
// }
