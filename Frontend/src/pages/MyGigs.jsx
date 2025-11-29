import React, { useEffect, useState } from 'react';

export default function MyGigs() {
  const [gigs, setGigs] = useState([]);
  useEffect(() => {
    // replace with API call
    setGigs([
      { id: 'G-101', title: 'Logo design for Ramen Shop', status: 'active', bids: 12, updatedAt: '2025-11-01' },
      { id: 'G-102', title: 'Build landing page (MVP)', status: 'in-review', bids: 4, updatedAt: '2025-11-20' },
    ]);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h2 className="text-xl font-semibold mb-4">Your Posted Gigs</h2>
      <div className="space-y-3">
        {gigs.map(g => (
          <div key={g.id} className="p-4 border rounded bg-white flex justify-between items-center">
            <div>
              <div className="font-semibold">{g.title}</div>
              <div className="text-sm text-gray-500">{g.id} — {g.bids} bids — updated {g.updatedAt}</div>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 border rounded">View</button>
              <button className="px-3 py-1 bg-yellow-100 rounded">Edit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
