import React, { useEffect, useState } from 'react';

export default function Updates() {
  const [updates, setUpdates] = useState([]);
  useEffect(() => {
    // replace with API call
    setUpdates([
      { id: 'U1', gigId: 'G-102', text: 'Freelancer submitted draft #1', time: '2025-11-28 12:02' },
      { id: 'U2', gigId: 'G-101', text: 'Client posted new requirement: mobile mockups', time: '2025-11-24 16:45' },
    ]);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h2 className="text-xl font-semibold mb-4">Updates on your gigs</h2>
      <div className="space-y-3">
        {updates.map(u => (
          <div key={u.id} className="p-3 border rounded bg-white">
            <div className="text-sm text-gray-600">{u.time} — {u.gigId}</div>
            <div className="mt-1">{u.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
