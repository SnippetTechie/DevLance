// src/components/Header.jsx
import React from 'react';

export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-3">
      </div>

      {/* keep empty right side for clean landing look; wallet actions happen on role pages */}
      <div />
    </header>
  );
}


// import React from "react";
// import { isEthereumAvailable } from "../utils/wallet";

// export default function Header({onConnectClick,connectedAddress}){
//     return (
//         <header className="flex items-center justify-between px-6 py-4">
//             <div className="flex items-center gap-3">
//                 <div className="font-bold text-lg">DevLance</div>
//                 <div className="text-sm text-gray-500">Web3 freelance</div>
//             </div>

//             <div className="flex items-center gap-3">
//                 {isEthereumAvailable() ? (
//                     <button 
//                     onClick={onConnectClick}
//                     className="px-4 py-2 rounded-md border hover:bg-gray-50"
//                     aria-label="Connect Wallet">
//                         {connectedAddress ? (
//                             <span className="text-sm">
//                                 {connectedAddress.slice(0,6)}...{connectedAddress.slice(-4)}
//                             </span>
//                         ):(
//                             'Connect Wallet'
//                         )}
//                     </button>
//                 ):(
//                     <div className="text-sm text-gray-500">No wallet detected</div>
//                 )}
//             </div>
//         </header>
//     );
// }