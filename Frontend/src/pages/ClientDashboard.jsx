// src/pages/ClientDashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import DashboardHeader from '../components/DashboardHeader';
import useWallet from '../hooks/useWallet';

export default function ClientDashboard() {
  const { wallet } = useWallet();

  // mock data (replace with hooks/api)
  const stats = { activeGigs: 2, pendingUpdates: 1, balance: '1.24 ETH' };
  const recent = [
    { id: 'G-102', title: 'Landing page (MVP)', action: 'Review draft', time: '2025-11-28 12:02', status: 'review' },
    { id: 'G-101', title: 'Logo & brand pack', action: 'Request: mobile mockups', time: '2025-11-24 16:45', status: 'open' },
  ];
  const myGigs = [
    { id: 'G-101', title: 'Logo design for Ramen Shop', bids: 12, updatedAt: '2025-11-01' },
    { id: 'G-102', title: 'Build landing page (MVP)', bids: 4, updatedAt: '2025-11-20' },
  ];

  return (
    <>
      <DashboardHeader />

      <div className="min-h-screen bg-gradient-to-b from-[#05060a] to-[#071019] text-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT: main form-like area (big card similar to CreateGig) */}
            <div className="lg:col-span-2">
              <div className="p-8 rounded-2xl bg-gradient-to-b from-[#07101a]/60 to-[#07101a]/30 border border-white/6 shadow-[0_8px_30px_rgba(2,6,23,0.6)]">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-extrabold text-white">Overview • Client</h2>
                    <p className="text-sm text-gray-300 mt-1">Manage gigs, review deliverables, and fund projects — all from here.</p>
                  </div>

                  <div className="text-sm text-gray-400">Secure escrow • IPFS pinned • 5% hold</div>
                </div>

                {/* stats row */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <MiniStat label="Active gigs" value={stats.activeGigs} />
                  <MiniStat label="Pending updates" value={stats.pendingUpdates} />
                  <MiniStat label="Escrow balance" value={stats.balance} sub={wallet ? shorten(wallet) : 'Not connected'} />
                </div>

                {/* main workspace */}
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <div className="mb-3 text-sm font-medium text-gray-300">Recent activity</div>
                    <div className="space-y-3">
                      {recent.map(item => (
                        <div key={item.id} className="p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-white/6 flex items-center justify-between">
                          <div>
                            <div className="font-medium text-white">{item.title}</div>
                            <div className="text-xs text-gray-400 mt-1">{item.time} • {item.id}</div>
                          </div>
                          <div className="text-xs font-medium text-indigo-400">{item.action}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="mb-3 text-sm font-medium text-gray-300">Your gigs</div>
                    <div className="space-y-3">
                      {myGigs.map(g => (
                        <div key={g.id} className="p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-white/6 flex items-center justify-between">
                          <div>
                            <div className="font-medium text-white">{g.title}</div>
                            <div className="text-xs text-gray-400 mt-1">{g.id} • {g.bids} bids • updated {g.updatedAt}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Link to={`/gigs/${g.id}`} className="px-2 py-1 text-xs rounded border text-gray-200">View</Link>
                            <Link to={`/gigs/${g.id}/edit`} className="px-2 py-1 text-xs rounded bg-yellow-50 text-black">Edit</Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* CTA row */}
                <div className="mt-6 flex items-center gap-3">
                  <Link to="/create-gig" className="px-5 py-3 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-500 text-white font-semibold shadow-[0_10px_30px_rgba(124,58,237,0.18)]">
                    Create Gig
                  </Link>
                  <Link to="/marketplace" className="px-4 py-3 rounded-2xl border border-white/6 text-gray-200">Browse Marketplace</Link>
                  <div className="ml-auto text-sm text-gray-400">Demo mode: <span className="font-medium text-gray-200">ON</span></div>
                </div>
              </div>
            </div>

            {/* RIGHT: summary sidebar like CreateGig */}
            <aside className="space-y-6">
              {/* Gig summary box */}
              <div className="p-6 rounded-2xl bg-gradient-to-b from-[#07101a]/50 to-[#07101a]/20 border border-white/6">
                <h3 className="text-sm text-gray-300 mb-4">Account summary</h3>

                <div className="text-sm text-gray-400 flex justify-between">
                  <div>Escrowed</div>
                  <div className="font-semibold text-white">{stats.balance}</div>
                </div>

                <div className="h-px my-4 bg-white/6" />

                <div className="text-sm text-gray-400">
                  <div className="flex justify-between py-1"><div>Active gigs</div><div className="font-semibold text-white">{stats.activeGigs}</div></div>
                  <div className="flex justify-between py-1"><div>Pending updates</div><div className="font-semibold text-white">{stats.pendingUpdates}</div></div>
                </div>

                <div className="h-px my-4 bg-white/6" />

                <div className="text-xs text-gray-400">Connected wallet</div>
                <div className="mt-1 font-mono text-sm text-white">{wallet ? shorten(wallet) : 'Not connected'}</div>

                <div className="mt-4 flex gap-2">
                  <Link to="/wallet" className="text-sm px-3 py-2 rounded bg-white/6 text-white">Open wallet</Link>
                  <Link to="/create-gig" className="text-sm px-3 py-2 rounded border border-white/6 text-gray-200">New gig</Link>
                </div>
              </div>

              {/* Pro tips box */}
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

/* ---------------- helpers ---------------- */

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


// import React from 'react';
// import { Link } from 'react-router-dom';
// import DashboardHeader from '../components/DashboardHeader';
// import useWallet from '../hooks/useWallet';

// export default function ClientDashboard() {
//   const { wallet } = useWallet();

//   // mock stats (replace with hooks/api)
//   const stats = { activeGigs: 2, pendingUpdates: 1, balance: '1.24 ETH' };

//   return (
//     <>
//       <DashboardHeader />

//       <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
//         <div className="max-w-7xl mx-auto px-6 py-10">
//           <div className="mb-8">
//             <h1 className="text-3xl font-extrabold text-gray-900">Welcome back</h1>
//             <p className="mt-1 text-sm text-gray-600 max-w-xl">
//               Quick overview of your gigs, updates and wallet. UI borrows the landing glassy style while staying focused.
//             </p>
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//             <StatCard title="Active gigs" value={stats.activeGigs} cta={{ to: '/my-gigs', label: 'View all' }} />
//             <StatCard title="Pending updates" value={stats.pendingUpdates} cta={{ to: '/updates', label: 'View updates' }} />
//             <StatCard title="Wallet balance" value={stats.balance} sub={wallet ? shorten(wallet) : 'Not connected'} cta={{ to: '/wallet', label: 'Open wallet' }} />
//           </div>

//           <div className="mt-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
//             <Link to="/create-gig" className="px-6 py-3 rounded-3xl btn-glass text-lg font-semibold inline-flex items-center gap-3">Create Gig</Link>
//             <Link to="/marketplace" className="px-5 py-3 rounded border hover:shadow-sm text-sm">Browse Marketplace</Link>
//             <div className="ml-auto text-sm text-gray-500 pt-2 sm:pt-0">Demo mode: <span className="font-medium">ON</span></div>
//           </div>

//           <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div className="p-6 bg-white/6 border border-white/6 rounded-2xl backdrop-blur-md">
//               <h3 className="text-base font-semibold text-gray-900 mb-2">Recent activity</h3>
//               <ul className="space-y-3 text-sm text-gray-600">
//                 <li className="p-3 rounded-md bg-white/5 flex items-start justify-between">
//                   <div>
//                     <div className="font-medium">Freelancer submitted draft #1</div>
//                     <div className="text-xs text-gray-500">G-102 — 2025-11-28 12:02</div>
//                   </div>
//                   <div className="text-xs text-indigo-600">Review</div>
//                 </li>
//                 <li className="p-3 rounded-md bg-white/5 flex items-start justify-between">
//                   <div>
//                     <div className="font-medium">Mobile mockups requested</div>
//                     <div className="text-xs text-gray-500">G-101 — 2025-11-24 16:45</div>
//                   </div>
//                   <div className="text-xs text-gray-600">Open</div>
//                 </li>
//               </ul>
//             </div>

//             <div className="p-6 bg-white/6 border border-white/6 rounded-2xl backdrop-blur-md">
//               <h3 className="text-base font-semibold text-gray-900 mb-2">Top actions</h3>
//               <div className="flex flex-col gap-3">
//                 <Link to="/create-gig" className="block px-4 py-3 rounded-md bg-indigo-50 text-sm font-medium">Post a new gig</Link>
//                 <Link to="/my-gigs" className="block px-4 py-3 rounded-md border text-sm">Manage posted gigs</Link>
//                 <Link to="/updates" className="block px-4 py-3 rounded-md border text-sm">See updates</Link>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

// /* subcomponents */
// function StatCard({ title, value, sub, cta }) {
//   return (
//     <div className="p-6 rounded-2xl bg-white/6 border border-white/6 backdrop-blur-md">
//       <div className="flex items-center justify-between">
//         <div>
//           <div className="text-sm text-gray-500">{title}</div>
//           <div className="mt-2 text-2xl font-bold text-gray-900">{value}</div>
//           {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
//         </div>
//         {cta && <Link to={cta.to} className="text-sm text-indigo-600 font-medium">{cta.label}</Link>}
//       </div>
//     </div>
//   );
// }

// function shorten(addr = '') {
//   if (!addr) return '';
//   return addr.length > 10 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;
// }
