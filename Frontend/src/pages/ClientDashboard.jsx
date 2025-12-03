// src/pages/ClientDashboard.jsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardHeader from '../components/DashboardHeader';
import useWallet from '../hooks/useWallet';
import useOnchainJobs from '../hooks/useOnchainJobs';

export default function ClientDashboard() {
  const { wallet } = useWallet();
  const { jobs, loading, error, refresh } = useOnchainJobs({ ownerAddress: wallet });

  const activeGigs = jobs ? jobs.length : 0;
  const pendingUpdates = jobs ? jobs.filter(j => Number(j.status) === 2).length : 0;
  const stats = { activeGigs, pendingUpdates, balance: '—' };

  useEffect(() => {
    refresh();
  }, [wallet]);

  return (
    <>
      <DashboardHeader />

      <div className="min-h-screen bg-gradient-to-b from-[#05060a] to-[#071019] text-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="p-8 rounded-2xl bg-gradient-to-b from-[#07101a]/60 to-[#07101a]/30 border border-white/6 shadow-[0_8px_30px_rgba(2,6,23,0.6)]">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-extrabold text-white">Overview • Client</h2>
                    <p className="text-sm text-gray-300 mt-1">Manage on-chain gigs, review deliverables, and release payments.</p>
                  </div>

                  <div className="text-sm text-gray-400">Secure escrow • IPFS pinned • 5% hold</div>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <MiniStat label="Active gigs" value={stats.activeGigs} />
                  <MiniStat label="Pending reviews" value={stats.pendingUpdates} />
                  <MiniStat label="Escrow balance" value={stats.balance} sub={wallet ? shorten(wallet) : 'Not connected'} />
                </div>

                <div className="mt-6">
                  <div className="mb-3 text-sm font-medium text-gray-300">Your gigs (on-chain)</div>

                  {loading && <div className="text-sm text-gray-400">Loading gigs from chain…</div>}
                  {error && <div className="text-sm text-red-400">Failed to load on-chain gigs: {String(error.message || error)} <button onClick={refresh} className="ml-2 px-2 py-1 rounded bg-white/6">Retry</button></div>}

                  {!loading && jobs && jobs.length === 0 && <div className="text-sm text-gray-400">You don't have any on-chain gigs yet. <Link to="/create-gig" className="underline">Create your first gig</Link>.</div>}

                  <div className="mt-3 space-y-3">
                    {jobs && jobs.map(j => {
                      const title = j.metadata?.title || (j.ipfsCID ? `IPFS:${shortenCID(j.ipfsCID)}` : `Job #${j.jobId}`);
                      const subtitle = j.metadata?.shortDesc || j.ipfsCID || '';
                      return (
                        <div key={j.jobId} className="p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-white/6 flex items-center justify-between">
                          <div>
                            <div className="font-medium text-white">{title}</div>
                            <div className="text-xs text-gray-400 mt-1">#{j.jobId} • {subtitle}</div>
                            <div className="mt-2 text-xs"><StatusBadge status={Number(j.status)} /></div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Link to={`/gigs/${j.jobId}`} className="px-2 py-1 text-xs rounded border text-gray-200">View</Link>
                            {Number(j.status) === 0 && <Link to={`/gigs/${j.jobId}/edit`} className="px-2 py-1 text-xs rounded bg-yellow-50 text-black">Edit</Link>}
                            {Number(j.status) === 2 && <Link to={`/gigs/${j.jobId}`} className="px-3 py-1 text-xs rounded bg-emerald-600 text-white">Review submission</Link>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-3">
                  <Link to="/create-gig" className="px-5 py-3 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-500 text-white font-semibold">Create Gig</Link>
                  <Link to="/marketplace" className="px-4 py-3 rounded-2xl border border-white/6 text-gray-200">Browse Marketplace</Link>
                  <div className="ml-auto text-sm text-gray-400">Demo mode: <span className="font-medium text-gray-200">OFF</span></div>
                </div>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="p-6 rounded-2xl bg-gradient-to-b from-[#07101a]/50 to-[#07101a]/20 border border-white/6">
                <h3 className="text-sm text-gray-300 mb-4">Account summary</h3>

                <div className="text-sm text-gray-400 flex justify-between"><div>Escrowed</div><div className="font-semibold text-white">{stats.balance}</div></div>
                <div className="h-px my-4 bg-white/6" />
                <div className="text-sm text-gray-400">
                  <div className="flex justify-between py-1"><div>Active gigs</div><div className="font-semibold text-white">{stats.activeGigs}</div></div>
                  <div className="flex justify-between py-1"><div>Pending reviews</div><div className="font-semibold text-white">{stats.pendingUpdates}</div></div>
                </div>
                <div className="h-px my-4 bg-white/6" />
                <div className="text-xs text-gray-400">Connected wallet</div>
                <div className="mt-1 font-mono text-sm text-white">{wallet ? shorten(wallet) : 'Not connected'}</div>
                <div className="mt-4 flex gap-2">
                  <Link to="/create-gig" className="text-sm px-3 py-2 rounded border border-white/6 text-gray-200">New gig</Link>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-b from-[#07101a]/40 to-[#07101a]/15 border border-white/6">
                <h4 className="text-sm font-semibold text-gray-200 mb-3">Pro tips</h4>
                <ul className="list-disc list-inside text-sm text-gray-400 space-y-2">
                  <li>Be explicit in deliverables (makes approval fast).</li>
                  <li>Use tags to make your gig discoverable.</li>
                  <li>Small attachments are fine — keep large files external.</li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}

/* helpers */
function MiniStat({ label, value, sub }) {
  return (
    <div className="p-4 rounded-lg bg-[rgba(255,255,255,0.02)] border border-white/6">
      <div className="text-xs text-gray-400">{label}</div>
      <div className="mt-2 text-lg font-semibold text-white">{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}
function shorten(addr = '') {
  if (!addr) return '';
  if (addr.length <= 12) return addr;
  return `${addr.slice(0,6)}...${addr.slice(-4)}`;
}
function shortenCID(cid = '') {
  if (!cid) return cid;
  return cid.length > 12 ? `${cid.slice(0,8)}...${cid.slice(-6)}` : cid;
}
function StatusBadge({ status }) {
  const mapping = {
    0: { label: 'Open', cls: 'bg-indigo-700 text-white' },
    1: { label: 'Accepted', cls: 'bg-yellow-600 text-black' },
    2: { label: 'Submitted', cls: 'bg-emerald-600 text-white' },
    3: { label: 'Partial paid', cls: 'bg-orange-600 text-white' },
    4: { label: 'Paid', cls: 'bg-gray-500 text-white' },
    5: { label: 'Cancelled', cls: 'bg-red-600 text-white' },
  };
  const item = mapping[Number(status)] || mapping[0];
  return <span className={`px-2 py-1 rounded text-xs font-medium ${item.cls}`}>{item.label}</span>;
}
