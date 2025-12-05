// src/components/DashboardHeader.jsx
import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import useWallet from '../hooks/useWallet';

export default function DashboardHeader() {
  const { wallet, connect, disconnect, role, setRole } = useWallet();

  return (
    <header className="w-full border-b border-white/10 relative z-50"
            style={{
              background: 'linear-gradient(to bottom, rgba(10, 10, 20, 0.8), rgba(15, 15, 25, 0.8))',
              backdropFilter: 'blur(20px)',
            }}>
      
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@700&display=swap');

          .logo-title {
            font-family: 'Poppins', sans-serif;
            font-weight: 700;
          }

          .nav-link {
            position: relative;
            transition: all 0.3s ease;
          }

          .nav-link::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 2px;
            background: linear-gradient(90deg, #6366f1, #8b5cf6);
            transition: width 0.3s ease;
          }

          .nav-link:hover::after,
          .nav-link-active::after {
            width: 80%;
          }

          .role-selector {
            background: rgba(20, 20, 30, 0.6);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.3s ease;
          }

          .role-selector:hover {
            background: rgba(30, 30, 45, 0.7);
            border-color: rgba(139, 92, 246, 0.3);
          }

          .connect-btn {
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(139, 92, 246, 0.3));
            backdrop-filter: blur(16px);
            border: 2px solid rgba(139, 92, 246, 0.4);
            transition: all 0.3s ease;
          }

          .connect-btn:hover {
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.4), rgba(139, 92, 246, 0.4));
            border-color: rgba(167, 139, 250, 0.6);
            transform: translateY(-1px);
            box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3);
          }

          .wallet-badge {
            background: rgba(20, 20, 30, 0.6);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
        `}
      </style>

      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-all">
                <span className="text-white font-bold text-lg">DL</span>
              </div>
              <div className="hidden md:block">
                <div className="logo-title text-xl text-white">DevLance</div>
                <div className="text-xs text-gray-400 -mt-0.5">
                  {role === 'client' ? 'Client Dashboard' : 'Freelancer Dashboard'}
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              <NavLink 
                to="/dashboard" 
                className={({isActive}) => `nav-link px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'nav-link-active text-white bg-white/10' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}
              >
                Overview
              </NavLink>
              <NavLink 
                to="/my-gigs" 
                className={({isActive}) => `nav-link px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'nav-link-active text-white bg-white/10' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}
              >
                My Gigs
              </NavLink>
              <NavLink 
                to="/create-gig" 
                className={({isActive}) => `nav-link px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'nav-link-active text-white bg-white/10' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}
              >
                Create Gig
              </NavLink>
              <NavLink 
                to="/marketplace" 
                className={({isActive}) => `nav-link px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'nav-link-active text-white bg-white/10' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}
              >
                Marketplace
              </NavLink>
            </nav>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            
            {/* Role Selector */}
            <div className="hidden sm:block">
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value)} 
                className="role-selector px-4 py-2 rounded-lg text-sm text-white outline-none cursor-pointer"
              >
                <option value="client">Client</option>
                <option value="freelancer">Freelancer</option>
              </select>
            </div>

            {/* Wallet Connection */}
            {wallet ? (
              <div className="flex items-center gap-2">
                <div className="wallet-badge px-4 py-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                    <span className="font-mono text-sm text-white">{shorten(wallet)}</span>
                  </div>
                </div>
                <button 
                  onClick={disconnect} 
                  className="px-4 py-2 rounded-lg border border-white/15 text-sm text-gray-300 hover:bg-white/5 hover:text-white hover:border-white/25 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button 
                onClick={() => connect()} 
                className="connect-btn px-6 py-2 rounded-lg text-sm font-semibold text-white"
              >
                Connect Wallet
              </button>
            )}
          </div>
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
