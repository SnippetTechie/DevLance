// // src/pages/Landing.jsx
// import React, { useEffect, useState } from 'react';
// import useConfig from '../hooks/useConfig';
// import { getChainId, isEthereumAvailable } from '../utils/wallet';
// import { useNavigate } from 'react-router-dom';

// export default function Landing() {
//   const { config } = useConfig();
//   const [networkWarning, setNetworkWarning] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     let mounted = true;
//     async function checkChain() {
//       if (!isEthereumAvailable()) return;
//       try {
//         const chainId = await getChainId();
//         if (!config) return;
//         if (chainId && config?.chainId && chainId !== config.chainId) {
//           if (mounted) setNetworkWarning(`Please switch to ${config.networkName} (${config.chainId})`);
//         } else {
//           if (mounted) setNetworkWarning(null);
//         }
//       } catch (_) {}
//     }
//     checkChain();
//     return () => (mounted = false);
//   }, [config]);

//   function handleRoleClick(role) {
//     if (role === 'client') return navigate('/create-gig');
//     if (role === 'developer') return navigate('/marketplace');
//   }

//   return (
//     <div className="min-h-screen relative overflow-hidden text-gray-100 bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#090912]">
//       {/* Background base gradients + soft large blobs */}
//       <div aria-hidden className="absolute inset-0 -z-20">
//         <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/20 via-purple-800/10 to-blue-900/20 blur-3xl opacity-60 animate-bgPulse"></div>

//         <div className="absolute top-1/3 -left-20 w-[35rem] h-[35rem] rounded-full bg-indigo-600/30 blur-[160px] opacity-40" />
//         <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] rounded-full bg-purple-600/30 blur-[170px] opacity-40" />
//       </div>

//       {/* Floating bubbles layer */}
//       <div aria-hidden className="absolute inset-0 -z-10 pointer-events-none">
//         <style>{`
//           /* bubble movement */
//           @keyframes floatUpA {
//             0% { transform: translateY(0) translateX(0) scale(1); opacity: 0.7; }
//             50% { transform: translateY(-40px) translateX(8px) scale(1.03); opacity: 0.85; }
//             100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.7; }
//           }
//           @keyframes floatUpB {
//             0% { transform: translateY(0) translateX(0) scale(1); opacity: 0.55; }
//             50% { transform: translateY(-80px) translateX(-18px) scale(1.06); opacity: 0.7; }
//             100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.55; }
//           }
//           @keyframes floatSlow {
//             0% { transform: translateY(0) translateX(0) rotate(0deg); }
//             50% { transform: translateY(-24px) translateX(12px) rotate(6deg); }
//             100% { transform: translateY(0) translateX(0) rotate(0deg); }
//           }

//           .bubble {
//             position: absolute;
//             border-radius: 9999px;
//             filter: blur(10px);
//             mix-blend-mode: screen;
//             opacity: 0.75;
//           }
//           .bubble-soft { filter: blur(14px); opacity: 0.45; }
//         `}</style>

//         {/* Bubbles: sizes, colors, positions, different animation timings */}
//         <div
//           className="bubble"
//           style={{
//             width: 220,
//             height: 220,
//             left: '6%',
//             top: '8%',
//             background:
//               'radial-gradient(circle at 30% 30%, rgba(99,102,241,0.28), rgba(99,102,241,0.12) 40%, transparent 60%)',
//             animation: 'floatUpA 9s ease-in-out infinite',
//             animationDelay: '0s',
//           }}
//         />
//         <div
//           className="bubble bubble-soft"
//           style={{
//             width: 420,
//             height: 200,
//             right: '6%',
//             top: '6%',
//             background:
//               'radial-gradient(circle at 70% 30%, rgba(168,85,247,0.16), rgba(99,102,241,0.06) 45%, transparent 65%)',
//             animation: 'floatUpB 14s ease-in-out infinite',
//             animationDelay: '1.5s',
//           }}
//         />
//         <div
//           className="bubble"
//           style={{
//             width: 120,
//             height: 120,
//             left: '20%',
//             bottom: '14%',
//             background:
//               'radial-gradient(circle at 40% 40%, rgba(34,211,238,0.14), rgba(79,70,229,0.04) 50%, transparent 70%)',
//             animation: 'floatUpA 11s ease-in-out infinite',
//             animationDelay: '0.8s',
//           }}
//         />
//         <div
//           className="bubble"
//           style={{
//             width: 160,
//             height: 160,
//             right: '18%',
//             bottom: '22%',
//             background:
//               'radial-gradient(circle at 60% 40%, rgba(99,102,241,0.12), rgba(99,102,241,0.06) 60%, transparent 80%)',
//             animation: 'floatUpB 10s ease-in-out infinite',
//             animationDelay: '2.6s',
//           }}
//         />
//         <div
//           className="bubble bubble-soft"
//           style={{
//             width: 80,
//             height: 80,
//             left: '38%',
//             top: '26%',
//             background:
//               'radial-gradient(circle at 50% 50%, rgba(99,102,241,0.12), rgba(79,70,229,0.04) 60%, transparent 80%)',
//             animation: 'floatSlow 12s ease-in-out infinite',
//             animationDelay: '3.3s',
//           }}
//         />
//         <div
//           className="bubble"
//           style={{
//             width: 100,
//             height: 100,
//             left: '72%',
//             top: '36%',
//             background:
//               'radial-gradient(circle at 40% 40%, rgba(168,85,247,0.14), rgba(99,102,241,0.06) 55%, transparent 75%)',
//             animation: 'floatUpA 13s ease-in-out infinite',
//             animationDelay: '4s',
//           }}
//         />
//         <div
//           className="bubble bubble-soft"
//           style={{
//             width: 260,
//             height: 140,
//             left: '50%',
//             bottom: '6%',
//             background:
//               'radial-gradient(circle at 30% 30%, rgba(79,70,229,0.12), rgba(99,102,241,0.04) 50%, transparent 75%)',
//             animation: 'floatUpB 16s ease-in-out infinite',
//             animationDelay: '1s',
//           }}
//         />
//       </div>

//       {/* Local styles used elsewhere (buttons, floats) */}
//       <style>
//         {`
//           @keyframes bgPulse {
//             0% { opacity: 0.45; }
//             50% { opacity: 0.65; }
//             100% { opacity: 0.45; }
//           }
//           .animate-bgPulse { animation: bgPulse 8s ease-in-out infinite; }

//           @keyframes floaty { 0% { transform: translateY(0);} 50% { transform: translateY(-6px);} 100% { transform: translateY(0);} }
//           .float-slow { animation: floaty 6s ease-in-out infinite; }

//           .btn-glass {
//             backdrop-filter: blur(20px);
//             background: linear-gradient(to right, rgba(99,102,241,0.12), rgba(79,70,229,0.06));
//             border: 1px solid rgba(255,255,255,0.06);
//             transition: 0.25s ease;
//           }
//           .btn-glass:hover {
//             border-color: rgba(255,255,255,0.18);
//             transform: translateY(-5px) scale(1.02);
//             box-shadow: 0 10px 25px rgba(99,102,241,0.25);
//           }

//           /* neon halo around the title (added) */
//           .neon-halo {
//             position: absolute;
//             inset: 0;
//             display: block;
//             filter: blur(28px);
//             opacity: 0.75;
//             pointer-events: none;
//             mix-blend-mode: screen;
//           }
//         `}
//       </style>

      

//       <main className="relative z-10 flex items-center justify-center px-10 py-24">
//         <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
//           {/* LEFT SIDE */}
//           {/* LEFT SIDE */}
// <div className="space-y-8 pt-8">

//   {/* Wrap badge + title together */}
//   <div className="relative inline-block">

//     {/* badge positioned to top-left of title */}
//     <div className="absolute -top-6 left-0 px-4 py-1.5 rounded-full bg-gradient-to-r 
//       from-indigo-500 via-purple-600 to-pink-500 text-sm font-semibold shadow-lg">
//       Beta • Web3
//     </div>

//     {/* neon halo behind title */}
//     <svg className="neon-halo" viewBox="0 0 600 160" preserveAspectRatio="xMidYMid slice" aria-hidden>
//       <defs>
//         <radialGradient id="halo1" cx="30%" cy="40%" r="50%">
//           <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.98" />
//           <stop offset="40%" stopColor="#60a5fa" stopOpacity="0.6" />
//           <stop offset="100%" stopColor="transparent" stopOpacity="0" />
//         </radialGradient>
//         <radialGradient id="halo2" cx="70%" cy="60%" r="50%">
//           <stop offset="0%" stopColor="#99f6e4" stopOpacity="0.85" />
//           <stop offset="45%" stopColor="#a78bfa" stopOpacity="0.45" />
//           <stop offset="100%" stopColor="transparent" stopOpacity="0" />
//         </radialGradient>
//       </defs>
//       <rect x="-10" y="-20" width="620" height="200" fill="url(#halo1)" />
//       <rect x="-10" y="-20" width="620" height="200" fill="url(#halo2)" opacity="0.45" />
//     </svg>

//     {/* Title */}
//     <h1 className="text-[4.6rem] md:text-[5.2rem] font-extrabold leading-[1.05] 
//        float-slow relative z-10">
//       DevLance
//     </h1>
//   </div>


//             <p className="text-gray-300 text-xl max-w-xl leading-relaxed">
//               A next-gen Web3 freelance marketplace — escrow-secured payments, IPFS-verified work, 
//               and milestone-based payouts.  
//               <br />
//               Built for <span className="font-semibold text-indigo-300">clarity, trust & speed</span>.
//             </p>

//             <div className="pt-4 flex flex-col sm:flex-row gap-5">
//               <button
//                 onClick={() => handleRoleClick('client')}
//                 className="btn-glass px-12 py-5 rounded-3xl text-lg font-semibold text-indigo-300 flex items-center justify-center gap-3"
//               >
//                 Hire • Post a Gig
//                 <svg className="w-6 h-6 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7-7 7" />
//                 </svg>
//               </button>

//               <button
//                 onClick={() => handleRoleClick('developer')}
//                 className="btn-glass px-12 py-5 rounded-3xl text-lg font-semibold text-gray-200 flex items-center justify-center gap-3"
//               >
//                 Work • Browse Gigs
//                 <svg className="w-6 h-6 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
//                 </svg>
//               </button>
//             </div>

//             <div className="text-sm text-gray-500">
//               Demo mode: <span className="font-semibold">{config?.demoMode ? 'ON' : 'OFF'}</span>
//               {config?.demoMode && config?.faucetUrl && (
//                 <> — <a className="underline text-indigo-300" href={config.faucetUrl} target="_blank" rel="noreferrer">Get test funds</a></>
//               )}
//               {networkWarning && <div className="mt-2 text-amber-400">{networkWarning}</div>}
//             </div>
//           </div>

//           {/* RIGHT SIDE — Feature Cards */}
//           <div className="grid grid-cols-1 gap-6">
//             <div className="p-7 bg-black/25 border border-white/10 rounded-2xl backdrop-blur-xl hover:scale-[1.015] transition-transform">
//               <div className="flex gap-4">
//                 <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-indigo-700/20 border border-indigo-600">
//                   <svg className="w-7 h-7 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeWidth="1.6" d="M12 8v4l3 3" />
//                     <path strokeWidth="1.6" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                   </svg>
//                 </div>
//                 <div>
//                   <h3 className="text-indigo-300 text-sm font-semibold">Escrowed Payments</h3>
//                   <p className="text-gray-300 text-sm mt-1">Funds are locked securely until milestones are approved.</p>
//                 </div>
//               </div>
//             </div>

//             <div className="p-7 bg-black/25 border border-white/10 rounded-2xl backdrop-blur-xl hover:scale-[1.015] transition-transform">
//               <div className="flex gap-4">
//                 <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-purple-700/20 border border-purple-600">
//                   <svg className="w-7 h-7 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeWidth="1.5" d="M12 20l9-5-9-5-9 5 9 5z" />
//                     <path strokeWidth="1.5" d="M12 12l9-5" />
//                   </svg>
//                 </div>
//                 <div>
//                   <h3 className="text-purple-300 text-sm font-semibold">IPFS Proof</h3>
//                   <p className="text-gray-300 text-sm mt-1">Work deliverables stored on IPFS for transparent proof.</p>
//                 </div>
//               </div>
//             </div>

//             <div className="p-7 bg-black/25 border border-white/10 rounded-2xl backdrop-blur-xl hover:scale-[1.015] transition-transform">
//               <div className="flex gap-4">
//                 <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-teal-700/20 border border-teal-600">
//                   <svg className="w-7 h-7 text-teal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeWidth="1.5" d="M3 7h18M3 12h18M3 17h18" />
//                   </svg>
//                 </div>
//                 <div>
//                   <h3 className="text-teal-300 text-sm font-semibold">Milestone Payouts</h3>
//                   <p className="text-gray-300 text-sm mt-1">Pay or receive funds step-by-step without risking the whole project.</p>
//                 </div>
//               </div>
//             </div>

//             <div className="p-7 bg-black/25 border border-white/10 rounded-2xl backdrop-blur-xl hover:scale-[1.015] transition-transform">
//               <div className="flex gap-4">
//                 <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-amber-700/20 border border-amber-600">
//                   <svg className="w-7 h-7 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeWidth="1.5" d="M12 2l3 7h7l-5.5 4 2 7-6-4-6 4 2-7L2 9h7l3-7z" />
//                   </svg>
//                 </div>
//                 <div>
//                   <h3 className="text-amber-300 text-sm font-semibold">Verified Reputation</h3>
//                   <p className="text-gray-300 text-sm mt-1">Proof-of-work tied to your wallet and on-chain history.</p>
//                 </div>
//               </div>
//             </div>

//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }

// import React, { useEffect, useState } from 'react';
// import useConfig from '../hooks/useConfig';
// import { getChainId, isEthereumAvailable } from '../utils/wallet';
// import { useNavigate } from 'react-router-dom';

// export default function Landing() {
//   const { config } = useConfig();
//   const [networkWarning, setNetworkWarning] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     let mounted = true;
//     async function checkChain() {
//       if (!isEthereumAvailable()) return;
//       try {
//         const chainId = await getChainId();
//         if (!config) return;
//         if (chainId && config?.chainId && chainId !== config.chainId) {
//           if (mounted) setNetworkWarning(`Please switch to ${config.networkName} (${config.chainId})`);
//         } else {
//           if (mounted) setNetworkWarning(null);
//         }
//       } catch (_) {}
//     }
//     checkChain();
//     return () => (mounted = false);
//   }, [config]);

//   function handleRoleClick(role) {
//     // If user clicks Hire -> we route to dashboard first (as requested)
//     if (role === 'client') return navigate('/dashboard');
//     // Developer (browse gigs) goes to marketplace
//     if (role === 'developer') return navigate('/marketplace');
//   }

//   return (
//     <div className="min-h-screen relative overflow-hidden text-gray-100 bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#090912]">
//       {/* Background gradients & blobs (kept from your original landing) */}
//       <div aria-hidden className="absolute inset-0 -z-20">
//         <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/20 via-purple-800/10 to-blue-900/20 blur-3xl opacity-60 animate-bgPulse"></div>
//         <div className="absolute top-1/3 -left-20 w-[35rem] h-[35rem] rounded-full bg-indigo-600/30 blur-[160px] opacity-40" />
//         <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] rounded-full bg-purple-600/30 blur-[170px] opacity-40" />
//       </div>

//       {/* Floating bubbles */}
//       <div aria-hidden className="absolute inset-0 -z-10 pointer-events-none">
//         <style>{`
//           @keyframes floatUpA { 0% { transform: translateY(0);} 50% { transform: translateY(-40px) translateX(8px);} 100% { transform: translateY(0);} }
//           @keyframes floatUpB { 0% { transform: translateY(0);} 50% { transform: translateY(-80px) translateX(-18px);} 100% { transform: translateY(0);} }
//           @keyframes floatSlow { 0% { transform: translateY(0);} 50% { transform: translateY(-24px) translateX(12px);} 100% { transform: translateY(0);} }
//         `}</style>
//         <div className="bubble" style={{ width: 220, height: 220, left: '6%', top: '8%', background: 'radial-gradient(circle at 30% 30%, rgba(99,102,241,0.28), rgba(99,102,241,0.12) 40%, transparent 60%)', animation: 'floatUpA 9s ease-in-out infinite' }} />
//         <div className="bubble bubble-soft" style={{ width: 420, height: 200, right: '6%', top: '6%', background: 'radial-gradient(circle at 70% 30%, rgba(168,85,247,0.16), rgba(99,102,241,0.06) 45%, transparent 65%)', animation: 'floatUpB 14s ease-in-out infinite' }} />
//         <div className="bubble" style={{ width: 120, height: 120, left: '20%', bottom: '14%', background: 'radial-gradient(circle at 40% 40%, rgba(34,211,238,0.14), rgba(79,70,229,0.04) 50%, transparent 70%)', animation: 'floatUpA 11s ease-in-out infinite' }} />
//       </div>

//       <style>{`
//         @keyframes bgPulse { 0% { opacity: 0.45; } 50% { opacity: 0.65; } 100% { opacity: 0.45; } }
//         .animate-bgPulse { animation: bgPulse 8s ease-in-out infinite; }
//         .btn-glass { backdrop-filter: blur(20px); background: linear-gradient(to right, rgba(99,102,241,0.12), rgba(79,70,229,0.06)); border: 1px solid rgba(255,255,255,0.06); transition: 0.25s ease; }
//         .btn-glass:hover { border-color: rgba(255,255,255,0.18); transform: translateY(-5px) scale(1.02); box-shadow: 0 10px 25px rgba(99,102,241,0.25); }
//       `}</style>

//       <main className="relative z-10 flex items-center justify-center px-6 py-24">
//         <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
//           <div className="space-y-8 pt-8">
//             <div className="relative inline-block">
//               <div className="absolute -top-6 left-0 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-sm font-semibold shadow-lg">Beta • Web3</div>
//               <h1 className="text-[4.6rem] md:text-[5.2rem] font-extrabold leading-[1.05]">
//                 DevLance
//               </h1>
//             </div>

//             <p className="text-gray-300 text-xl max-w-xl leading-relaxed">
//               A next-gen Web3 freelance marketplace — escrow-secured payments, IPFS-verified work, and milestone-based payouts.
//               <br /> Built for <span className="font-semibold text-indigo-300">clarity, trust & speed</span>.
//             </p>

//             <div className="pt-4 flex flex-col sm:flex-row gap-5">
//               <button onClick={() => handleRoleClick('client')} className="btn-glass px-12 py-5 rounded-3xl text-lg font-semibold text-indigo-300 flex items-center justify-center gap-3">
//                 Hire • Post a Gig
//                 <svg className="w-6 h-6 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7-7 7" /></svg>
//               </button>

//               <button onClick={() => handleRoleClick('developer')} className="btn-glass px-12 py-5 rounded-3xl text-lg font-semibold text-gray-200 flex items-center justify-center gap-3">
//                 Work • Browse Gigs
//                 <svg className="w-6 h-6 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
//               </button>
//             </div>

//             <div className="text-sm text-gray-500">
//               Demo mode: <span className="font-semibold">{config?.demoMode ? 'ON' : 'OFF'}</span>
//               {config?.demoMode && config?.faucetUrl && (<> — <a className="underline text-indigo-300" href={config.faucetUrl} target="_blank" rel="noreferrer">Get test funds</a></>)}
//               {networkWarning && <div className="mt-2 text-amber-400">{networkWarning}</div>}
//             </div>
//           </div>

//           <div className="grid grid-cols-1 gap-6">
//             <FeatureCard title="Escrowed Payments" body="Funds are locked securely until milestones are approved." icon="clock" />
//             <FeatureCard title="IPFS Proof" body="Work deliverables stored on IPFS for transparent proof." icon="ipfs" />
//             <FeatureCard title="Milestone Payouts" body="Pay or receive funds step-by-step without risking the whole project." icon="milestone" />
//             <FeatureCard title="Verified Reputation" body="Proof-of-work tied to your wallet and on-chain history." icon="star" />
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }

// /* helper components */
// function FeatureCard({ title, body }) {
//   return (
//     <div className="p-7 bg-black/25 border border-white/10 rounded-2xl backdrop-blur-xl hover:scale-[1.015] transition-transform">
//       <div className="flex gap-4">
//         <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-indigo-700/20 border border-indigo-600">
//           <svg className="w-7 h-7 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="1.6" d="M12 8v4l3 3" /><path strokeWidth="1.6" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
//         </div>
//         <div>
//           <h3 className="text-indigo-300 text-sm font-semibold">{title}</h3>
//           <p className="text-gray-300 text-sm mt-1">{body}</p>
//         </div>
//       </div>
//     </div>
//   );
// }

// src/pages/Landing.jsx
import React, { useEffect, useState } from 'react';
import useConfig from '../hooks/useConfig';
import { getChainId, isEthereumAvailable } from '../utils/wallet';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const { config } = useConfig();
  const [networkWarning, setNetworkWarning] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    async function checkChain() {
      if (!isEthereumAvailable()) return;
      try {
        const chainId = await getChainId();
        if (!config) return;
        if (chainId && config?.chainId && chainId !== config.chainId) {
          if (mounted) setNetworkWarning(`Please switch to ${config.networkName} (${config.chainId})`);
        } else {
          if (mounted) setNetworkWarning(null);
        }
      } catch (_) {}
    }
    checkChain();
    return () => (mounted = false);
  }, [config]);

  function handleRoleClick(role) {
    // If user clicks Hire -> we route to dashboard first (as requested)
    if (role === 'client') return navigate('/dashboard');
    // Developer (browse gigs) goes to marketplace
    if (role === 'developer') return navigate('/marketplace');
  }

  return (
    <div className="min-h-screen relative overflow-hidden text-gray-100 bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#090912]">
      {/* Background base gradients + soft large blobs */}
      <div aria-hidden className="absolute inset-0 -z-20">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/20 via-purple-800/10 to-blue-900/20 blur-3xl opacity-60 animate-bgPulse"></div>

        <div className="absolute top-1/3 -left-20 w-[35rem] h-[35rem] rounded-full bg-indigo-600/30 blur-[160px] opacity-40" />
        <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] rounded-full bg-purple-600/30 blur-[170px] opacity-40" />
      </div>

      {/* Floating bubbles layer (ADDED) */}
      <div aria-hidden className="absolute inset-0 -z-10 pointer-events-none">
        <style>{`
          /* bubble movement */
          @keyframes floatUpA {
            0% { transform: translateY(0) translateX(0) scale(1); opacity: 0.7; }
            50% { transform: translateY(-40px) translateX(8px) scale(1.03); opacity: 0.85; }
            100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.7; }
          }
          @keyframes floatUpB {
            0% { transform: translateY(0) translateX(0) scale(1); opacity: 0.55; }
            50% { transform: translateY(-80px) translateX(-18px) scale(1.06); opacity: 0.7; }
            100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.55; }
          }
          @keyframes floatSlow {
            0% { transform: translateY(0) translateX(0) rotate(0deg); }
            50% { transform: translateY(-24px) translateX(12px) rotate(6deg); }
            100% { transform: translateY(0) translateX(0) rotate(0deg); }
          }

          .bubble {
            position: absolute;
            border-radius: 9999px;
            filter: blur(10px);
            mix-blend-mode: screen;
            opacity: 0.75;
          }
          .bubble-soft { filter: blur(14px); opacity: 0.45; }
        `}</style>

        {/* Bubbles: sizes, colors, positions, different animation timings */}
        <div
          className="bubble"
          style={{
            width: 220,
            height: 220,
            left: '6%',
            top: '8%',
            background:
              'radial-gradient(circle at 30% 30%, rgba(99,102,241,0.28), rgba(99,102,241,0.12) 40%, transparent 60%)',
            animation: 'floatUpA 9s ease-in-out infinite',
            animationDelay: '0s',
          }}
        />
        <div
          className="bubble bubble-soft"
          style={{
            width: 420,
            height: 200,
            right: '6%',
            top: '6%',
            background:
              'radial-gradient(circle at 70% 30%, rgba(168,85,247,0.16), rgba(99,102,241,0.06) 45%, transparent 65%)',
            animation: 'floatUpB 14s ease-in-out infinite',
            animationDelay: '1.5s',
          }}
        />
        <div
          className="bubble"
          style={{
            width: 120,
            height: 120,
            left: '20%',
            bottom: '14%',
            background:
              'radial-gradient(circle at 40% 40%, rgba(34,211,238,0.14), rgba(79,70,229,0.04) 50%, transparent 70%)',
            animation: 'floatUpA 11s ease-in-out infinite',
            animationDelay: '0.8s',
          }}
        />
        <div
          className="bubble"
          style={{
            width: 160,
            height: 160,
            right: '18%',
            bottom: '22%',
            background:
              'radial-gradient(circle at 60% 40%, rgba(99,102,241,0.12), rgba(99,102,241,0.06) 60%, transparent 80%)',
            animation: 'floatUpB 10s ease-in-out infinite',
            animationDelay: '2.6s',
          }}
        />
        <div
          className="bubble bubble-soft"
          style={{
            width: 80,
            height: 80,
            left: '38%',
            top: '26%',
            background:
              'radial-gradient(circle at 50% 50%, rgba(99,102,241,0.12), rgba(79,70,229,0.04) 60%, transparent 80%)',
            animation: 'floatSlow 12s ease-in-out infinite',
            animationDelay: '3.3s',
          }}
        />
        <div
          className="bubble"
          style={{
            width: 100,
            height: 100,
            left: '72%',
            top: '36%',
            background:
              'radial-gradient(circle at 40% 40%, rgba(168,85,247,0.14), rgba(99,102,241,0.06) 55%, transparent 75%)',
            animation: 'floatUpA 13s ease-in-out infinite',
            animationDelay: '4s',
          }}
        />
        <div
          className="bubble bubble-soft"
          style={{
            width: 260,
            height: 140,
            left: '50%',
            bottom: '6%',
            background:
              'radial-gradient(circle at 30% 30%, rgba(79,70,229,0.12), rgba(99,102,241,0.04) 50%, transparent 75%)',
            animation: 'floatUpB 16s ease-in-out infinite',
            animationDelay: '1s',
          }}
        />
      </div>

      {/* Local styles used elsewhere (buttons, floats) */}
      <style>
        {`
          @keyframes bgPulse {
            0% { opacity: 0.45; }
            50% { opacity: 0.65; }
            100% { opacity: 0.45; }
          }
          .animate-bgPulse { animation: bgPulse 8s ease-in-out infinite; }

          @keyframes floaty { 0% { transform: translateY(0);} 50% { transform: translateY(-6px);} 100% { transform: translateY(0);} }
          .float-slow { animation: floaty 6s ease-in-out infinite; }

          .btn-glass {
            backdrop-filter: blur(20px);
            background: linear-gradient(to right, rgba(99,102,241,0.12), rgba(79,70,229,0.06));
            border: 1px solid rgba(255,255,255,0.06);
            transition: 0.25s ease;
          }
          .btn-glass:hover {
            border-color: rgba(255,255,255,0.18);
            transform: translateY(-5px) scale(1.02);
            box-shadow: 0 10px 25px rgba(99,102,241,0.25);
          }

          /* neon halo around the title (ADDED) */
          .neon-halo {
            position: absolute;
            inset: 0;
            display: block;
            filter: blur(28px);
            opacity: 0.75;
            pointer-events: none;
            mix-blend-mode: screen;
          }
        `}
      </style>

      <main className="relative z-10 flex items-center justify-center px-6 py-24">
        <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          <div className="space-y-8 pt-8">
            <div className="relative inline-block">
              <div className="absolute -top-6 left-0 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-sm font-semibold shadow-lg">Beta • Web3</div>

              {/* neon halo behind title (ADDED) */}
              <svg className="neon-halo" viewBox="0 0 600 160" preserveAspectRatio="xMidYMid slice" aria-hidden>
                <defs>
                  <radialGradient id="halo1" cx="30%" cy="40%" r="50%">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.98" />
                    <stop offset="40%" stopColor="#60a5fa" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id="halo2" cx="70%" cy="60%" r="50%">
                    <stop offset="0%" stopColor="#99f6e4" stopOpacity="0.85" />
                    <stop offset="45%" stopColor="#a78bfa" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <rect x="-10" y="-20" width="620" height="200" fill="url(#halo1)" />
                <rect x="-10" y="-20" width="620" height="200" fill="url(#halo2)" opacity="0.45" />
              </svg>

              <h1 className="text-[4.6rem] md:text-[5.2rem] font-extrabold leading-[1.05] float-slow relative z-10">
                DevLance
              </h1>
            </div>

            <p className="text-gray-300 text-xl max-w-xl leading-relaxed">
              A next-gen Web3 freelance marketplace — escrow-secured payments, IPFS-verified work, and milestone-based payouts.
              <br /> Built for <span className="font-semibold text-indigo-300">clarity, trust & speed</span>.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-5">
              <button onClick={() => handleRoleClick('client')} className="btn-glass px-12 py-5 rounded-3xl text-lg font-semibold text-indigo-300 flex items-center justify-center gap-3">
                Hire • Post a Gig
                <svg className="w-6 h-6 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7-7 7" /></svg>
              </button>

              <button onClick={() => handleRoleClick('developer')} className="btn-glass px-12 py-5 rounded-3xl text-lg font-semibold text-gray-200 flex items-center justify-center gap-3">
                Work • Browse Gigs
                <svg className="w-6 h-6 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>

            <div className="text-sm text-gray-500">
              Demo mode: <span className="font-semibold">{config?.demoMode ? 'ON' : 'OFF'}</span>
              {config?.demoMode && config?.faucetUrl && (
                <> — <a className="underline text-indigo-300" href={config.faucetUrl} target="_blank" rel="noreferrer">Get test funds</a></>
              )}
              {networkWarning && <div className="mt-2 text-amber-400">{networkWarning}</div>}
            </div>
          </div>

          {/* RIGHT SIDE — Feature Cards */}
          <div className="grid grid-cols-1 gap-6">
            <div className="p-7 bg-black/25 border border-white/10 rounded-2xl backdrop-blur-xl hover:scale-[1.015] transition-transform">
              <div className="flex gap-4">
                <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-indigo-700/20 border border-indigo-600">
                  <svg className="w-7 h-7 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth="1.6" d="M12 8v4l3 3" />
                    <path strokeWidth="1.6" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-indigo-300 text-sm font-semibold">Escrowed Payments</h3>
                  <p className="text-gray-300 text-sm mt-1">Funds are locked securely until milestones are approved.</p>
                </div>
              </div>
            </div>

            <div className="p-7 bg-black/25 border border-white/10 rounded-2xl backdrop-blur-xl hover:scale-[1.015] transition-transform">
              <div className="flex gap-4">
                <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-purple-700/20 border border-purple-600">
                  <svg className="w-7 h-7 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth="1.5" d="M12 20l9-5-9-5-9 5 9 5z" />
                    <path strokeWidth="1.5" d="M12 12l9-5" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-purple-300 text-sm font-semibold">IPFS Proof</h3>
                  <p className="text-gray-300 text-sm mt-1">Work deliverables stored on IPFS for transparent proof.</p>
                </div>
              </div>
            </div>

            <div className="p-7 bg-black/25 border border-white/10 rounded-2xl backdrop-blur-xl hover:scale-[1.015] transition-transform">
              <div className="flex gap-4">
                <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-teal-700/20 border border-teal-600">
                  <svg className="w-7 h-7 text-teal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth="1.5" d="M3 7h18M3 12h18M3 17h18" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-teal-300 text-sm font-semibold">Milestone Payouts</h3>
                  <p className="text-gray-300 text-sm mt-1">Pay or receive funds step-by-step without risking the whole project.</p>
                </div>
              </div>
            </div>

            <div className="p-7 bg-black/25 border border-white/10 rounded-2xl backdrop-blur-xl hover:scale-[1.015] transition-transform">
              <div className="flex gap-4">
                <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-amber-700/20 border border-amber-600">
                  <svg className="w-7 h-7 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth="1.5" d="M12 2l3 7h7l-5.5 4 2 7-6-4-6 4 2-7L2 9h7l3-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-amber-300 text-sm font-semibold">Verified Reputation</h3>
                  <p className="text-gray-300 text-sm mt-1">Proof-of-work tied to your wallet and on-chain history.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

/* helper components */
function FeatureCard({ title, body }) {
  return (
    <div className="p-7 bg-black/25 border border-white/10 rounded-2xl backdrop-blur-xl hover:scale-[1.015] transition-transform">
      <div className="flex gap-4">
        <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-indigo-700/20 border border-indigo-600">
          <svg className="w-7 h-7 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="1.6" d="M12 8v4l3 3" /><path strokeWidth="1.6" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <div>
          <h3 className="text-indigo-300 text-sm font-semibold">{title}</h3>
          <p className="text-gray-300 text-sm mt-1">{body}</p>
        </div>
      </div>
    </div>
  );
}
