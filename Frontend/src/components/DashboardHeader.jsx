// import React from 'react';
// import { Link, NavLink, useNavigate } from 'react-router-dom';
// import useWallet from '../hooks/useWallet';

// /**
//  * Header — matches landing theme: glass, compact, neon accent
//  * Use this as the global header if you want (but earlier we used DashboardHeader for dashboard-only).
//  */
// export default function Header() {
//   const { wallet, connect, disconnect, role, setRole } = useWallet();
//   const navigate = useNavigate();

//   return (
//     <header className="w-full border-b bg-gradient-to-r from-white/40 to-white/20 backdrop-blur-md">
//       <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
//         <div className="flex items-center gap-6">
//           <Link to="/" className="flex items-center gap-3">
//             <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-500 shadow-md text-white font-bold">DL</div>
//             <div className="hidden sm:block">
//               <div className="text-lg font-extrabold tracking-tight text-gray-900">DevLance</div>
//               <div className="text-xs text-gray-500 -mt-1">Beta • Web3</div>
//             </div>
//           </Link>

//           <nav className="hidden md:flex items-center gap-2">
//             <NavLink to="/dashboard" className={({isActive}) => `px-3 py-1 rounded ${isActive ? 'text-gray-900 font-semibold' : 'text-gray-600 hover:text-gray-900'}`}>Dashboard</NavLink>
//             <NavLink to="/marketplace" className={({isActive}) => `px-3 py-1 rounded ${isActive ? 'text-gray-900 font-semibold' : 'text-gray-600 hover:text-gray-900'}`}>Marketplace</NavLink>
//             <NavLink to="/create-gig" className={({isActive}) => `px-3 py-1 rounded ${isActive ? 'text-gray-900 font-semibold' : 'text-gray-600 hover:text-gray-900'}`}>Create Gig</NavLink>
//             <NavLink to="/my-gigs" className={({isActive}) => `px-3 py-1 rounded ${isActive ? 'text-gray-900 font-semibold' : 'text-gray-600 hover:text-gray-900'}`}>My Gigs</NavLink>
//           </nav>
//         </div>

//         <div className="flex items-center gap-3">
//           {/* Role select small */}
//           <div className="hidden sm:flex items-center gap-2 bg-white/30 border rounded px-3 py-1">
//             <select value={role} onChange={(e) => setRole(e.target.value)} className="bg-transparent text-sm outline-none">
//               <option value="client">Client</option>
//               <option value="freelancer">Freelancer</option>
//             </select>
//           </div>

//           {/* Wallet compact */}
//           <div className="flex items-center gap-2 bg-white/6 border rounded px-3 py-1">
//             <div className="text-xs text-gray-500">Wallet</div>
//             <div className="font-mono text-sm">{wallet ? shorten(wallet) : 'Not connected'}</div>
//             {wallet ? (
//               <button onClick={disconnect} className="ml-2 px-2 py-1 rounded bg-red-50 text-xs">Disconnect</button>
//             ) : (
//               <button onClick={() => connect()} className="ml-2 px-3 py-1 rounded bg-indigo-600 text-white text-sm">Connect</button>
//             )}
//           </div>

//           {/* Quick wallet page button */}
//           <button onClick={() => navigate('/wallet')} className="hidden sm:inline-block px-3 py-1 border rounded text-sm">Wallet</button>
//         </div>
//       </div>
//     </header>
//   );
// }

// /* small helper */
// function shorten(addr = '') {
//   if (!addr) return '';
//   return addr.length > 10 ? `${addr.slice(0,6)}...${addr.slice(-4)}` : addr;
// }



// src/components/DashboardHeader.jsx
import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import useWallet from '../hooks/useWallet';

export default function DashboardHeader() {
  const { wallet, connect, disconnect, role, setRole } = useWallet();
  const navigate = useNavigate();

  return (
    <header className="w-full border-b border-black/30 bg-gradient-to-b from-[#07070b] to-[#0b0d12]">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-500 shadow-[0_6px_18px_rgba(124,58,237,0.18)] text-white font-bold">DL</div>
            <div className="hidden md:block">
              <div className="text-lg font-extrabold text-white">DevLance</div>
              <div className="text-xs text-gray-300 -mt-0.5">Client dashboard</div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-2 text-sm text-gray-300">
            <NavLink to="/dashboard" className={({isActive}) => `px-3 py-1 rounded ${isActive ? 'bg-white/6 text-white font-medium' : 'hover:bg-white/3'}`}>Overview</NavLink>
            <NavLink to="/my-gigs" className={({isActive}) => `px-3 py-1 rounded ${isActive ? 'bg-white/6 text-white font-medium' : 'hover:bg-white/3'}`}>My Gigs</NavLink>
            <NavLink to="/create-gig" className={({isActive}) => `px-3 py-1 rounded ${isActive ? 'bg-white/6 text-white font-medium' : 'hover:bg-white/3'}`}>Create Gig</NavLink>
            <NavLink to="/marketplace" className={({isActive}) => `px-3 py-1 rounded ${isActive ? 'bg-white/6 text-white font-medium' : 'hover:bg-white/3'}`}>Marketplace</NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded bg-white/3 px-2 py-1">
            <select value={role} onChange={(e) => setRole(e.target.value)} className="bg-transparent text-sm outline-none text-white">
              <option value="client">Client</option>
              <option value="freelancer">Freelancer</option>
            </select>
          </div>

          <div className="flex items-center gap-3 bg-white/3 border border-white/6 rounded px-3 py-1">
            <div className="text-xs text-gray-300">Wallet</div>
            <div className="font-mono text-sm text-white">{wallet ? shorten(wallet) : 'Not connected'}</div>
            {wallet ? (
              <button onClick={disconnect} className="ml-2 px-2 py-1 rounded bg-white/6 text-xs text-white">Disconnect</button>
            ) : (
              <button onClick={() => connect()} className="ml-2 px-3 py-1 rounded bg-gradient-to-br from-purple-600 to-indigo-500 text-xs text-white shadow-sm">Connect</button>
            )}
          </div>

          <button onClick={() => navigate('/wallet')} className="hidden sm:inline-block px-3 py-1 border rounded border-white/6 text-sm text-gray-300">Wallet</button>
        </div>
      </div>
    </header>
  );
}

function shorten(addr = '') {
  if (!addr) return '';
  if (addr.length <= 12) return addr;
  return `${addr.slice(0,6)}...${addr.slice(-4)}`;
}
