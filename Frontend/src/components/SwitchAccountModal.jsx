import React from 'react';

export default function SwitchAccountModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold">Demo: Switch MetaMask account</h3>
        <p className="mt-3 text-sm text-gray-600">
          To simulate different users (Client / Developer) in the same browser:
        </p>
        <ol className="list-decimal pl-6 mt-3 text-sm text-gray-600">
          <li>Open MetaMask extension.</li>
          <li>Click the account avatar (top right) → Select another account or Import Account (private key).</li>
          <li>If you imported Ganache keys, switch between them to simulate roles.</li>
          <li>Do not use real wallets or real private keys for demo.</li>
        </ol>
        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-md border">Got it</button>
        </div>
      </div>
    </div>
  );
}
