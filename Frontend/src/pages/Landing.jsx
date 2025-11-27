// src/pages/Landing.jsx
import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import RoleButton from '../components/RoleButton';
import SwitchAccountModal from '../components/SwitchAccountModal';
import useConfig from '../hooks/useConfig';
import { requestAccounts, getAccounts, getChainId, isEthereumAvailable } from '../utils/wallet';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const { config } = useConfig();
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [networkWarning, setNetworkWarning] = useState(null);
  const [currentAddress, setCurrentAddress] = useState(null);
  const [pendingRole, setPendingRole] = useState(null); // 'client' | 'developer' or null
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    async function checkChain() {
      if (!isEthereumAvailable()) return;
      try {
        const chainId = await getChainId();
        if (!config) return;
        if (chainId && config?.chainId && chainId !== config.chainId) {
          if (mounted) setNetworkWarning(`Please switch your wallet to ${config.networkName} (${config.chainId})`);
        } else {
          if (mounted) setNetworkWarning(null);
        }
      } catch (e) {
        // ignore
      }
    }
    checkChain();

    if (isEthereumAvailable()) {
      // update currentAddress if user changes accounts in MetaMask
      window.ethereum?.on('accountsChanged', (accs) => setCurrentAddress(accs?.[0] || null));
      window.ethereum?.on('chainChanged', () => window.location.reload());
      // initial accounts
      getAccounts().then((accs) => setCurrentAddress(accs?.[0] || null)).catch(()=>{});
    }

    return () => (mounted = false);
  }, [config]);

  // Called when user clicks a role on landing.
  // We attempt to request accounts (so MetaMask opens a connect chooser).
  // If accounts exist but user might want to switch, we show the helper modal.
  async function handleRoleClick(role) {
    setPendingRole(role);
    if (!isEthereumAvailable()) {
      // no wallet — still navigate (or show message). Here we navigate but you could show an instruction.
      return navigateToRole(role);
    }

    try {
      // This will prompt MetaMask to connect/select accounts if not already connected.
      const accounts = await requestAccounts(); // may return immediately if already connected
      const first = accounts?.[0] || null;
      setCurrentAddress(first);

      // If multiple accounts exist in MetaMask but the UI didn't ask user to switch,
      // we still allow them to manually switch via the helper modal.
      // Check how many accounts are available (eth_accounts)
      const all = await getAccounts();
      if (all && all.length > 1) {
        // Ask user to confirm/switch if they want to use a different account.
        setShowSwitchModal(true);
        // We'll navigate only when user closes modal and confirms (see onClose below).
        return;
      }

      // otherwise navigate immediately
      navigateToRole(role);
    } catch (e) {
      // user rejected or error — show the modal to help them switch/import accounts
      setShowSwitchModal(true);
    }
  }

  function navigateToRole(role) {
    setPendingRole(null);
    if (role === 'client') return navigate('/create-gig');
    if (role === 'developer') return navigate('/marketplace');
  }

  // Called when user closes the helper modal. We provide two options:
  // - they clicked 'Got it' (we'll continue with current connected account)
  // - or they can manually switch accounts in MetaMask and then retry the role click.
  function onSwitchModalClose({ proceed = false } = {}) {
    setShowSwitchModal(false);
    if (proceed && pendingRole) {
      navigateToRole(pendingRole);
    } else {
      // keep pendingRole so user can click again after switching account
      setPendingRole(null);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div>
            <h1 className="text-4xl font-bold">Welcome to DevLance</h1>
            <p className="mt-4 text-gray-700">
              DevLance is a Web3 freelance marketplace — escrowed payments, verifiable IPFS proofs, and milestone
              payouts. Choose your role to get started.
            </p>

            <ul className="mt-6 space-y-3">
              <li className="flex items-start gap-3">
                <div className="font-medium">Escrow</div>
                <div className="text-gray-600">Client locks funds until work is approved.</div>
              </li>
              <li className="flex items-start gap-3">
                <div className="font-medium">IPFS proof</div>
                <div className="text-gray-600">Work artifacts are stored as IPFS hashes for transparency.</div>
              </li>
              <li className="flex items-start gap-3">
                <div className="font-medium">Partial pay</div>
                <div className="text-gray-600">Milestones allow partial payments to be released.</div>
              </li>
            </ul>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <RoleButton
                dataTestId="hire-btn"
                title="Hire (Client)"
                subtitle="Post a gig and lock funds in escrow"
                onClick={() => handleRoleClick('client')}
              />
              <RoleButton
                dataTestId="work-btn"
                title="Work (Developer)"
                subtitle="Browse gigs and submit proposals"
                onClick={() => handleRoleClick('developer')}
              />
            </div>

            <div className="mt-6 text-sm text-gray-600">
              Demo mode: <span className="font-medium">{config?.demoMode ? 'ON' : 'OFF'}</span>
              {config?.demoMode && config?.faucetUrl && (
                <> — <a className="underline" href={config.faucetUrl} target="_blank" rel="noreferrer">get test funds</a></>
              )}
              <div className="mt-2">Why connect? <span className="text-gray-600">To sign transactions — we never ask for private keys.</span></div>
              {networkWarning && <div className="mt-3 text-sm text-yellow-700">{networkWarning}</div>}
            </div>
          </div>

          <div className="p-8 bg-gray-50 rounded-2xl border">
            <div className="text-sm text-gray-600">Quick demo</div>
            <div className="mt-4">
              <ol className="list-decimal pl-6 text-gray-700">
                <li>Click a role to continue — MetaMask will prompt you to choose an account.</li>
                <li>Switch MetaMask account to simulate the other role in the same browser.</li>
                <li>Use Ganache imported keys for local funds (demo only).</li>
              </ol>
            </div>

            <div className="mt-6">
              <div className="text-sm font-medium">Total gigs</div>
              <div className="text-2xl font-bold">{config?.totalGigs ?? '—'}</div>
              <div className="mt-4 text-sm text-gray-500">(fetched from backend when available)</div>
            </div>

            <div className="mt-6">
              <button onClick={() => setShowSwitchModal(true)} className="px-4 py-2 rounded-md border">Demo: Switch account helper</button>
            </div>
          </div>
        </div>
      </main>

      <SwitchAccountModal open={showSwitchModal} onClose={() => onSwitchModalClose({ proceed: true })} />
    </div>
  );
}


// import React, {useEffect,useState} from 'react';
// import Header from '../components/Header';
// import RoleButton from '../components/RoleButton';
// import SwitchAccountModal from '../components/SwitchAccountModal';
// import useConfig from '../hooks/useConfig';
// import { requestAccounts,getChainId,isEthereumAvailable } from '../utils/wallet';
// import {useNavigate} from 'react-router-dom';

// export default function Landing() {
//   const { config, loading: cfgLoading } = useConfig();
//   const [connectedAddress, setConnectedAddress] = useState(null);
//   const [showSwitchModal, setShowSwitchModal] = useState(false);
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
//           if (mounted) setNetworkWarning(`Please switch your wallet to ${config.networkName} (${config.chainId})`);
//         } else {
//           if (mounted) setNetworkWarning(null);
//         }
//       } catch (e) {
//         // ignore
//       }
//     }
//     checkChain();

//     // Listen for account changes
//     if (isEthereumAvailable()) {
//       window.ethereum?.on('accountsChanged', (accs) => setConnectedAddress(accs?.[0] || null));
//       window.ethereum?.on('chainChanged', () => window.location.reload());
//     }

//     return () => (mounted = false);
//   }, [config]);

//   async function handleConnect() {
//     try {
//       const accounts = await requestAccounts();
//       setConnectedAddress(accounts[0]);
//     } catch (e) {
//       console.error('connect failed', e);
//     }
//   }

//   function goClient() {
//     // client path: create gig
//     // We do not force connect here; navigation happens and next page can request connect
//     navigate('/create-gig');
//   }
//   function goDeveloper() {
//     navigate('/marketplace');
//   }

//   return (
//     <div className="min-h-screen flex flex-col">
//       <Header onConnectClick={() => (connectedAddress ? setShowSwitchModal(true) : handleConnect())} connectedAddress={connectedAddress} />

//       <main className="flex-1 flex items-center justify-center p-6">
//         <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
//           <div>
//             <h1 className="text-4xl font-bold">Welcome to DevLance</h1>
//             <p className="mt-4 text-gray-700">
//               DevLance is a Web3 freelance marketplace — escrowed payments, verifiable IPFS proofs, and milestone
//               payouts. Choose your role to get started.
//             </p>

//             <ul className="mt-6 space-y-3">
//               <li className="flex items-start gap-3">
//                 <div className="font-medium">Escrow</div>
//                 <div className="text-gray-600">Client locks funds until work is approved.</div>
//               </li>
//               <li className="flex items-start gap-3">
//                 <div className="font-medium">IPFS proof</div>
//                 <div className="text-gray-600">Work artifacts are stored as IPFS hashes for transparency.</div>
//               </li>
//               <li className="flex items-start gap-3">
//                 <div className="font-medium">Partial pay</div>
//                 <div className="text-gray-600">Milestones allow partial payments to be released.</div>
//               </li>
//             </ul>

//             <div className="mt-8 flex flex-col sm:flex-row gap-4">
//               <RoleButton dataTestId="hire-btn" title="Hire (Client)" subtitle="Post a gig and lock funds in escrow" onClick={goClient} />
//               <RoleButton dataTestId="work-btn" title="Work (Developer)" subtitle="Browse gigs and submit proposals" onClick={goDeveloper} />
//             </div>

//             <div className="mt-6 text-sm text-gray-600">
//               Demo mode: <span className="font-medium">{config?.demoMode ? 'ON' : 'OFF'}</span>
//               {config?.demoMode && config?.faucetUrl && (
//                 <> — <a className="underline" href={config.faucetUrl} target="_blank" rel="noreferrer">get test funds</a></>
//               )}
//               <div className="mt-2">Why connect? <span className="text-gray-600">To sign transactions — we never ask for private keys.</span></div>
//               {networkWarning && <div className="mt-3 text-sm text-yellow-700">{networkWarning}</div>}
//             </div>
//           </div>

//           <div className="p-8 bg-gray-50 rounded-2xl border">
//             <div className="text-sm text-gray-600">Quick demo</div>
//             <div className="mt-4">
//               <ol className="list-decimal pl-6 text-gray-700">
//                 <li>Click a role to continue (we will request wallet connect when necessary).</li>
//                 <li>Switch MetaMask account to simulate the other role in the same browser.</li>
//                 <li>Use Ganache imported keys for local funds (demo only).</li>
//               </ol>
//             </div>

//             <div className="mt-6">
//               <div className="text-sm font-medium">Total gigs</div>
//               <div className="text-2xl font-bold">{config?.totalGigs ?? '—'}</div>
//               <div className="mt-4 text-sm text-gray-500">(fetched from backend when available)</div>
//             </div>

//             <div className="mt-6">
//               <button onClick={() => setShowSwitchModal(true)} className="px-4 py-2 rounded-md border">Demo: Switch account helper</button>
//             </div>
//           </div>
//         </div>
//       </main>

//       <SwitchAccountModal open={showSwitchModal} onClose={() => setShowSwitchModal(false)} />
//     </div>
//   );
// }