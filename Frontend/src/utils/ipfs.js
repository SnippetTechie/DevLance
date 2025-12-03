// src/utils/ipfs.js
export async function pinMetadataJSON(metadata) {
  const base = import.meta.env.VITE_API_BASE_URL || '/api';
  const endpoint = `${base}/ipfs`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ metadata }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Pinning failed: ${res.status} ${text}`);
  }
  const json = await res.json();
  if (!json.hash) throw new Error('Pinning failed: no CID returned');
  return json; // { hash, url? }
}

