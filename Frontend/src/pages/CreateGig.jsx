// src/pages/CreateGig.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pinMetadataJSON } from '../utils/ipfs';
import { createGigOnchain } from '../utils/contract';
import { isEthereumAvailable, requestAccounts } from '../utils/wallet';
import { ethers } from 'ethers';

const SECURITY_HOLD_BPS = 500; // 5% in basis points
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

  // compute security hold in wei as bigint
  function computeSecurityHoldWei(amountEthStr) {
    try {
      const amountWei = ethers.parseEther(String(amountEthStr || '0')); // bigint
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
      setError('MetaMask (or injected wallet) not found. Please install or use another browser.');
      return;
    }

    setLoading(true);
    try {
      // Build metadata (inviteAddress stored only in metadata since contract doesn't accept it)
      const metadata = {
        title,
        shortDesc,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        inviteAddress: inviteAddress || null,
        deliverableChecklist,
        sampleFiles: sampleFiles.map((f) => ({ name: f.name, size: f.size })),
        createdAt: new Date().toISOString(),
      };

      // Pin metadata to IPFS (your existing util)
      const pinRes = await pinMetadataJSON(metadata);
      if (!pinRes || !pinRes.hash) throw new Error('Pinning failed — aborting create');
      setPinnedCID(pinRes.hash);

      // compute exact wei bigints
      const amountWei = ethers.parseEther(String(amountEth)); // bigint
      const holdWei = computeSecurityHoldWei(amountEth); // bigint
      const totalValue = amountWei + holdWei; // bigint

      // show preview and require user confirm before wallet
      const previewMsg = `You are about to create a gig that locks ${ethers.formatEther(
        amountWei
      )} ETH plus a security hold of ${ethers.formatEther(holdWei)} ETH (total ${ethers.formatEther(
        totalValue
      )} ETH).`;
      const ok = window.confirm(previewMsg + '\n\nProceed to wallet to confirm?');
      if (!ok) {
        setLoading(false);
        return;
      }

      // force wallet popup / account selection
      await requestAccounts();

      setTxStatus('pending');

      // call util createGigOnchain which calls contract.createGig(ipfsCID, amountWei, deadlineDays) payable
      const txResp = await createGigOnchain({
        ipfsCID: pinRes.hash,
        amountWei: amountWei.toString(),         // string of bigint
        deadlineDays: Number(deadlineDays),
        valueWei: totalValue.toString(),         // msg.value override as string
      });

      setTxHash(txResp.hash);
      setTxStatus('pending');

      // wait for first confirmation
      const receipt = await txResp.wait(1);
      if (receipt && receipt.status === 1) {
        setTxStatus('confirmed');
        // optionally navigate to gigs page:
        // navigate('/my-gigs');
      } else {
        setTxStatus('failed');
        setError('Transaction failed on-chain (status != 1)');
      }
    } catch (e) {
      console.error(e);
      // Format common metamask/provider errors
      if (e?.data?.message) setError(e.data.message);
      else if (e?.error?.message) setError(e.error.message);
      else setError(e?.message || String(e));
      setTxStatus('failed');
    } finally {
      setLoading(false);
    }
  }

  const explorerBase = import.meta.env.VITE_EXPLORER_TX_URL || '';

  /* UI helpers using ethers */
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
    <div className="min-h-screen bg-gradient-to-b from-[#06060a] to-[#04050a] text-gray-200 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-gradient-to-b from-[#07121a]/60 to-[#07121a]/30 border border-white/6 p-8 shadow-[0_8px_40px_rgba(2,6,23,0.7)]">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-extrabold text-white">Create a Gig</h2>
                <div className="text-sm text-gray-400">Secure escrow • IPFS pinned • 5% hold</div>
              </div>

              <div className="mt-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Title</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Short, punchy title (e.g. Build landing page with web3 integration)"
                    className="mt-2 w-full p-4 rounded-lg bg-[#06101a] border border-white/6 placeholder-gray-500 text-white focus:ring-0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300">Short description</label>
                  <textarea
                    value={shortDesc}
                    onChange={(e) => setShortDesc(e.target.value)}
                    rows={5}
                    placeholder="Describe the task, deliverables, and expectations"
                    className="mt-2 w-full p-4 rounded-lg bg-[#06101a] border border-white/6 placeholder-gray-500 text-white focus:ring-0 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Amount (ETH)</label>
                    <input
                      value={amountEth}
                      onChange={(e) => setAmountEth(e.target.value)}
                      placeholder="e.g. 0.5"
                      className="mt-2 w-full p-3 rounded-lg bg-[#06101a] border border-white/6 placeholder-gray-500 text-white focus:ring-0"
                    />
                    <div className="text-xs text-gray-500 mt-2">Min {MIN_AMOUNT_ETH} • Max {MAX_AMOUNT_ETH}</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300">Deadline (days)</label>
                    <input
                      type="number"
                      value={deadlineDays}
                      min={MIN_DEADLINE_DAYS}
                      max={MAX_DEADLINE_DAYS}
                      onChange={(e) => setDeadlineDays(e.target.value)}
                      className="mt-2 w-full p-3 rounded-lg bg-[#06101a] border border-white/6 placeholder-gray-500 text-white focus:ring-0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300">Tags (comma)</label>
                    <input
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="web3, solidity"
                      className="mt-2 w-full p-3 rounded-lg bg-[#06101a] border border-white/6 placeholder-gray-500 text-white focus:ring-0"
                    />
                    <div className="text-xs text-gray-500 mt-2">Up to 8 tags — helps devs find your gig.</div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300">Invite wallet address (optional)</label>
                  <input
                    value={inviteAddress}
                    onChange={(e) => setInviteAddress(e.target.value)}
                    placeholder="0x... (stored in metadata only)"
                    className="mt-2 w-full p-3 rounded-lg bg-[#06101a] border border-white/6 placeholder-gray-500 text-white focus:ring-0"
                  />
                  <div className="text-xs text-gray-500 mt-2">Invite address is saved in IPFS metadata only.</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300">Deliverable checklist</label>
                  <textarea
                    value={deliverableChecklist}
                    onChange={(e) => setDeliverableChecklist(e.target.value)}
                    rows={4}
                    placeholder="List deliverables, one per line"
                    className="mt-2 w-full p-4 rounded-lg bg-[#06101a] border border-white/6 placeholder-gray-500 text-white focus:ring-0 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300">Sample files (optional)</label>
                  <div className="mt-2 flex items-center gap-4">
                    <label className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-500 text-white cursor-pointer shadow-md">
                      <input type="file" multiple onChange={handleFilesChange} className="sr-only" />
                      Upload files
                    </label>
                    <div className="text-sm text-gray-400">
                      Max 10 small files • actual pinning handled separately
                      <div className="text-xs text-gray-500 mt-1">{sampleFiles.length} files attached</div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/6" />

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs text-gray-400">Security hold</div>
                    <div className="text-lg font-semibold text-white">5% of amount</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleCreateClick}
                      disabled={loading}
                      className="px-6 py-3 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-500 text-white font-semibold shadow-[0_10px_30px_rgba(124,58,237,0.18)] disabled:opacity-60"
                    >
                      {loading ? 'Creating…' : 'Connect Wallet → Create & Lock'}
                    </button>

                    <button
                      onClick={() => navigate(-1)}
                      className="px-4 py-3 rounded-2xl border border-white/6 text-gray-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                {pinnedCID && (
                  <div className="mt-4 text-sm text-gray-300">
                    Metadata pinned: <span className="font-mono text-gray-200">{pinnedCID}</span>
                  </div>
                )}

                {txHash && (
                  <div className="mt-4 p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-white/6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-400">Transaction</div>
                        <div className="font-mono text-sm text-white">{txHash}</div>
                        {explorerBase ? (
                          <a className="text-sm text-indigo-300 underline" href={`${explorerBase}${txHash}`} target="_blank" rel="noreferrer">View on explorer</a>
                        ) : (
                          <div className="text-sm text-gray-500">Explorer link not configured</div>
                        )}
                      </div>

                      <div>
                        {txStatus === 'pending' && <div className="text-yellow-400">Creating… (waiting confirmation)</div>}
                        {txStatus === 'confirmed' && <div className="text-emerald-400">Gig Open — confirmed</div>}
                        {txStatus === 'failed' && <div className="text-red-500">Transaction failed</div>}
                      </div>
                    </div>
                  </div>
                )}

                {error && <div className="mt-3 text-sm text-red-400">{error}</div>}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl bg-gradient-to-b from-[#07121a]/55 to-[#07121a]/25 border border-white/6 p-6">
              <h3 className="text-lg font-semibold text-white">Gig summary</h3>

              <div className="mt-4 space-y-3 text-sm text-gray-300">
                <div className="flex justify-between">
                  <div>Amount</div>
                  <div className="font-medium">{(Number(amountEth) || 0).toLocaleString(undefined, {maximumFractionDigits:6})} ETH</div>
                </div>

                <div className="flex justify-between">
                  <div>Security hold (5%)</div>
                  <div className="font-medium">{securityHold()}</div>
                </div>

                <div className="h-px my-2 bg-white/6" />

                <div className="flex justify-between text-sm">
                  <div>Total required</div>
                  <div className="text-xl font-semibold text-indigo-300">{totalRequired()}</div>
                </div>

                <div className="h-px my-3 bg-white/6" />

                <div className="text-xs text-gray-400">Deadline</div>
                <div className="text-sm text-gray-200">{deadlineDays} days • by {new Date(Date.now() + Number(deadlineDays) * 24*60*60*1000).toLocaleDateString()}</div>

                <div className="mt-3 text-xs text-gray-400">Tags</div>
                <div className="text-sm text-gray-200">{tags ? tags.split(',').map(t=>t.trim()).filter(Boolean).join(', ') : 'No tags'}</div>

                <div className="mt-3 text-xs text-gray-400">Files attached</div>
                <div className="text-sm text-gray-200">{sampleFiles.length} files • {sampleFiles.reduce((s,f)=> s + (f.size||0),0)} B</div>
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-b from-[#07121a]/45 to-[#07121a]/18 border border-white/6 p-6">
              <h4 className="text-sm font-semibold text-white mb-3">Pro tips</h4>
              <ul className="list-disc list-inside text-sm text-gray-400 space-y-2">
                <li>Be explicit in deliverables (makes approval fast).</li>
                <li>Use tags to make your gig discoverable.</li>
                <li>Keep large files external — add links in checklist.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}



// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { pinMetadataJSON } from '../utils/ipfs';
// import { createGigOnchain } from '../utils/contract';
// import { isEthereumAvailable, requestAccounts } from '../utils/wallet';

// const SECURITY_HOLD_PERCENT = 0.05;
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
//     const { ethers } = require('ethers');
//     const amountWei = ethers.utils.parseEther(String(amountEthStr));
//     const hold = amountWei.mul(Math.floor(SECURITY_HOLD_PERCENT * 100)).div(100);
//     return hold;
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
//       setError('MetaMask (or injected wallet) not found. Please install or use another browser.');
//       return;
//     }

//     setLoading(true);
//     try {
//       const metadata = {
//         title,
//         shortDesc,
//         tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
//         inviteAddress: inviteAddress || null,
//         deliverableChecklist,
//         sampleFiles: sampleFiles.map((f) => ({ name: f.name, size: f.size })),
//         createdAt: new Date().toISOString(),
//       };

//       const pinRes = await pinMetadataJSON(metadata);
//       if (!pinRes || !pinRes.hash) throw new Error('Pinning failed — aborting create');
//       setPinnedCID(pinRes.hash);

//       const { ethers } = require('ethers');
//       const amountWeiBN = ethers.utils.parseEther(String(amountEth));
//       const holdWeiBN = computeSecurityHoldWei(amountEth);
//       const totalValueBN = amountWeiBN.add(holdWeiBN);

//       const previewMsg = `You are about to create a gig that locks ${ethers.utils.formatEther(
//         amountWeiBN
//       )} ETH plus a security hold of ${ethers.utils.formatEther(holdWeiBN)} ETH (total ${ethers.utils.formatEther(
//         totalValueBN
//       )} ETH).`;

//       const ok = window.confirm(previewMsg + '\n\nProceed to wallet to confirm?');
//       if (!ok) {
//         setLoading(false);
//         return;
//       }

//       await requestAccounts();

//       setTxStatus('pending');
//       const txResp = await createGigOnchain({
//         ipfsCID: pinRes.hash,
//         amountWei: amountWeiBN.toString(),
//         deadlineDays: Number(deadlineDays),
//         valueWei: totalValueBN.toString(),
//       });

//       setTxHash(txResp.hash);
//       setTxStatus('pending');

//       const receipt = await txResp.wait(1);
//       if (receipt && receipt.status === 1) {
//         setTxStatus('confirmed');
//         // optional: navigate to /my-gigs after success
//         // navigate('/my-gigs');
//       } else {
//         setTxStatus('failed');
//         setError('Transaction failed on-chain (status != 1)');
//       }
//     } catch (e) {
//       console.error(e);
//       setError(e.message || String(e));
//       setTxStatus('failed');
//     } finally {
//       setLoading(false);
//     }
//   }

//   const explorerBase = import.meta.env.VITE_EXPLORER_TX_URL || '';

//   return (
//     <div className="min-h-screen bg-gray-50 py-12">
//       <div className="max-w-3xl mx-auto p-8 bg-white rounded-2xl shadow">
//         <h2 className="text-2xl font-semibold mb-4">Create Gig</h2>

//         <div className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium">Title</label>
//             <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full p-3 border rounded" placeholder="Short title" />
//           </div>

//           <div>
//             <label className="block text-sm font-medium">Short description</label>
//             <textarea value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} className="mt-1 w-full p-3 border rounded" rows="4" />
//           </div>

//           <div className="grid grid-cols-3 gap-3">
//             <div>
//               <label className="block text-sm font-medium">Amount (ETH)</label>
//               <input value={amountEth} onChange={(e) => setAmountEth(e.target.value)} className="mt-1 w-full p-3 border rounded" placeholder="e.g. 0.5" />
//             </div>

//             <div>
//               <label className="block text-sm font-medium">Deadline (days)</label>
//               <input type="number" value={deadlineDays} min={MIN_DEADLINE_DAYS} max={MAX_DEADLINE_DAYS} onChange={(e) => setDeadlineDays(e.target.value)} className="mt-1 w-full p-3 border rounded" />
//             </div>

//             <div>
//               <label className="block text-sm font-medium">Tags (comma)</label>
//               <input value={tags} onChange={(e) => setTags(e.target.value)} className="mt-1 w-full p-3 border rounded" placeholder="web3, solidity" />
//             </div>
//           </div>

//           <div>
//             <label className="block text-sm font-medium">Invite wallet address (optional)</label>
//             <input value={inviteAddress} onChange={(e) => setInviteAddress(e.target.value)} className="mt-1 w-full p-3 border rounded" placeholder="0x..." />
//           </div>

//           <div>
//             <label className="block text-sm font-medium">Deliverable checklist (text)</label>
//             <textarea value={deliverableChecklist} onChange={(e) => setDeliverableChecklist(e.target.value)} className="mt-1 w-full p-3 border rounded" rows="3" placeholder="List deliverables line by line" />
//           </div>

//           <div>
//             <label className="block text-sm font-medium">Sample files (optional)</label>
//             <input type="file" multiple onChange={handleFilesChange} className="mt-2" />
//             <div className="text-sm text-gray-500 mt-1">Files will be included as metadata file list; actual file pinning must be handled by backend or the pinning service.</div>
//           </div>

//           <div className="flex gap-3 items-center">
//             <button onClick={handleCreateClick} className="px-4 py-2 rounded bg-blue-600 text-white" disabled={loading}>
//               {loading ? 'Creating…' : 'Connect Wallet → Create & Lock Payment'}
//             </button>
//             <button onClick={() => navigate(-1)} className="px-3 py-2 rounded border">Cancel</button>
//           </div>

//           {pinnedCID && <div className="mt-2 text-sm">Metadata pinned: <span className="font-mono">{pinnedCID}</span></div>}

//           {txHash && (
//             <div className="mt-4 p-3 border rounded bg-gray-50">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <div className="text-sm text-gray-600">Transaction</div>
//                   <div className="font-mono">{txHash}</div>
//                   {explorerBase ? <a className="text-sm text-blue-600 underline" href={`${explorerBase}${txHash}`} target="_blank" rel="noreferrer">View on explorer</a> : <div className="text-sm text-gray-500">Explorer link not configured</div>}
//                 </div>

//                 <div>
//                   {txStatus === 'pending' && <div className="text-yellow-700">Creating… (waiting confirmation)</div>}
//                   {txStatus === 'confirmed' && <div className="text-green-600">Gig Open — confirmed</div>}
//                   {txStatus === 'failed' && <div className="text-red-600">Transaction failed</div>}
//                 </div>
//               </div>
//             </div>
//           )}

//           {error && <div className="text-red-600 mt-2">{error}</div>}
//         </div>
//       </div>
//     </div>
//   );
// }


