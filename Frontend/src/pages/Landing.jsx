
// // src/pages/Landing.jsx
import React, { useEffect } from 'react';
import FloatingLines from '../components/FloatingLines';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  function handleRoleClick(role) {
    if (role === 'developer') return navigate('/marketplace');
    if (role === 'client') return navigate('/dashboard');
  }

  return (
    <div className="min-h-screen relative overflow-hidden text-white bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#090912]">
      
      {/* ========== FLOATING BACKGROUND ========== */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 1 }}>
        <FloatingLines
          linesGradient={['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd']}
          enabledWaves={['top', 'middle', 'bottom']}
          lineCount={[8, 12, 16]}
          lineDistance={[6, 5, 4]}
          animationSpeed={0.9}
          interactive={true}
          parallax={true}
          parallaxStrength={0.18}
          mixBlendMode="screen"
        />
      </div>

      {/* Background gradients */}
      <div aria-hidden className="absolute inset-0 -z-20">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/20 via-purple-800/10 to-blue-900/20 blur-3xl opacity-60 animate-bgPulse"></div>
        <div className="absolute top-1/3 -left-20 w-[35rem] h-[35rem] rounded-full bg-indigo-600/30 blur-[160px] opacity-40" />
        <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] rounded-full bg-purple-600/30 blur-[170px] opacity-40" />
      </div>

      {/* Floating bubbles */}
      <div aria-hidden className="absolute inset-0 -z-10 pointer-events-none">
        <style>{`
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

        <div className="bubble" style={{ width: 220, height: 220, left: '6%', top: '8%', background: 'radial-gradient(circle at 30% 30%, rgba(99,102,241,0.28), rgba(99,102,241,0.12) 40%, transparent 60%)', animation: 'floatUpA 9s ease-in-out infinite', animationDelay: '0s' }} />
        <div className="bubble bubble-soft" style={{ width: 420, height: 200, right: '6%', top: '6%', background: 'radial-gradient(circle at 70% 30%, rgba(168,85,247,0.16), rgba(99,102,241,0.06) 45%, transparent 65%)', animation: 'floatUpB 14s ease-in-out infinite', animationDelay: '1.5s' }} />
        <div className="bubble" style={{ width: 120, height: 120, left: '20%', bottom: '14%', background: 'radial-gradient(circle at 40% 40%, rgba(34,211,238,0.14), rgba(79,70,229,0.04) 50%, transparent 70%)', animation: 'floatUpA 11s ease-in-out infinite', animationDelay: '0.8s' }} />
        <div className="bubble" style={{ width: 160, height: 160, right: '18%', bottom: '22%', background: 'radial-gradient(circle at 60% 40%, rgba(99,102,241,0.12), rgba(99,102,241,0.06) 60%, transparent 80%)', animation: 'floatUpB 10s ease-in-out infinite', animationDelay: '2.6s' }} />
        <div className="bubble bubble-soft" style={{ width: 80, height: 80, left: '38%', top: '26%', background: 'radial-gradient(circle at 50% 50%, rgba(99,102,241,0.12), rgba(79,70,229,0.04) 60%, transparent 80%)', animation: 'floatSlow 12s ease-in-out infinite', animationDelay: '3.3s' }} />
        <div className="bubble" style={{ width: 100, height: 100, left: '72%', top: '36%', background: 'radial-gradient(circle at 40% 40%, rgba(168,85,247,0.14), rgba(99,102,241,0.06) 55%, transparent 75%)', animation: 'floatUpA 13s ease-in-out infinite', animationDelay: '4s' }} />
        <div className="bubble bubble-soft" style={{ width: 260, height: 140, left: '50%', bottom: '6%', background: 'radial-gradient(circle at 30% 30%, rgba(79,70,229,0.12), rgba(99,102,241,0.04) 50%, transparent 75%)', animation: 'floatUpB 16s ease-in-out infinite', animationDelay: '1s' }} />
      </div>

      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&family=Inter:wght@400;500;600&display=swap');

          * {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
          }

          @keyframes bgPulse {
            0% { opacity: 0.45; }
            50% { opacity: 0.65; }
            100% { opacity: 0.45; }
          }
          .animate-bgPulse { animation: bgPulse 8s ease-in-out infinite; }

          @keyframes floaty { 
            0% { transform: translateY(0);} 
            50% { transform: translateY(-10px);} 
            100% { transform: translateY(0);} 
          }
          .float-slow { animation: floaty 6s ease-in-out infinite; }

          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }

          .title-font {
            font-family: 'Poppins', 'Inter', sans-serif;
            font-weight: 700;
          }

          .btn-primary {
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2));
            backdrop-filter: blur(16px);
            border: 2px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4),
                        inset 0 1px 0 rgba(255, 255, 255, 0.1);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
          }

          .btn-primary::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.6s;
          }

          .btn-primary:hover::before {
            left: 100%;
          }

          .btn-primary:hover {
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(139, 92, 246, 0.3));
            border-color: rgba(255, 255, 255, 0.35);
            transform: translateY(-3px);
            box-shadow: 0 12px 48px rgba(99, 102, 241, 0.4),
                        inset 0 1px 0 rgba(255, 255, 255, 0.15);
          }

          .btn-secondary {
            background: rgba(20, 20, 30, 0.4);
            backdrop-filter: blur(16px);
            border: 2px solid rgba(255, 255, 255, 0.15);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4),
                        inset 0 1px 0 rgba(255, 255, 255, 0.05);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
          }

          .btn-secondary::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
            transition: left 0.6s;
          }

          .btn-secondary:hover::before {
            left: 100%;
          }

          .btn-secondary:hover {
            background: rgba(30, 30, 45, 0.6);
            border-color: rgba(255, 255, 255, 0.25);
            transform: translateY(-3px);
            box-shadow: 0 12px 48px rgba(139, 92, 246, 0.3),
                        inset 0 1px 0 rgba(255, 255, 255, 0.1);
          }

          .dark-vignette {
            background: radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.3) 70%);
          }
        `}
      </style>

      {/* Dark vignette overlay */}
      <div className="dark-vignette fixed inset-0 pointer-events-none z-5"></div>

      <main className="relative z-10 flex items-center justify-center min-h-screen px-6 py-24">
        <div className="max-w-4xl w-full text-center space-y-12">
          
          {/* Beta Badge */}
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-black/30 border border-white/20 backdrop-blur-xl">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-400"></span>
            </span>
            <span className="text-sm font-semibold tracking-widest text-white uppercase">Beta • Web3</span>
          </div>

          {/* Main Title - Better sized with Poppins (700 weight - not too thick) */}
          <div className="relative">
            <h1 className="title-font text-[5.5rem] md:text-[7.5rem] lg:text-[8.5rem] leading-[0.9] tracking-tight float-slow"
                style={{
                  color: '#ffffff',
                  textShadow: '0 2px 40px rgba(0, 0, 0, 0.8), 0 0 80px rgba(139, 92, 246, 0.3)',
                }}>
              DevLance
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl lg:text-3xl leading-relaxed max-w-3xl mx-auto font-medium"
             style={{
               color: '#ffffff',
               textShadow: '0 2px 30px rgba(0, 0, 0, 0.9)',
             }}>
            Next-generation <span className="font-bold">Web3</span> freelance marketplace
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-base md:text-lg"
               style={{
                 color: '#ffffff',
                 textShadow: '0 2px 20px rgba(0, 0, 0, 0.8)',
               }}>
            <span className="px-4 py-2 rounded-full bg-black/30 border border-white/15 backdrop-blur-md font-medium">
              Escrow-secured
            </span>
            <span className="px-4 py-2 rounded-full bg-black/30 border border-white/15 backdrop-blur-md font-medium">
              IPFS-verified
            </span>
            <span className="px-4 py-2 rounded-full bg-black/30 border border-white/15 backdrop-blur-md font-medium">
              Milestone payouts
            </span>
          </div>

          {/* CTA Buttons - No emojis */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-5">
            <button 
              onClick={() => handleRoleClick('developer')} 
              className="btn-primary px-12 py-5 rounded-2xl text-lg font-bold text-white flex items-center justify-center gap-3 min-w-[240px]"
            >
              Find Work
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5M6 12h12" />
              </svg>
            </button>

            <button 
              onClick={() => handleRoleClick('client')} 
              className="btn-secondary px-12 py-5 rounded-2xl text-lg font-bold text-white flex items-center justify-center gap-3 min-w-[240px]"
            >
              Hire Talent
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5M6 12h12" />
              </svg>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
