// src/utils/helpers.js
import { ethers } from 'ethers';

export const JobStatus = { Open: 0, InProgress: 1, Submitted: 2, Completed: 3, Cancelled: 4 };

export const StatusLabels = {
  [JobStatus.Open]: 'Open',
  [JobStatus.InProgress]: 'In Progress',
  [JobStatus.Submitted]: 'Submitted',
  [JobStatus.Completed]: 'Completed',
  [JobStatus.Cancelled]: 'Cancelled',
};

export const StatusColors = {
  [JobStatus.Open]: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  [JobStatus.InProgress]: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  [JobStatus.Submitted]: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  [JobStatus.Completed]: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  [JobStatus.Cancelled]: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

export function formatEth(weiValue, decimals = 4) {
  if (!weiValue) return '0';
  try {
    return parseFloat(ethers.formatEther(weiValue.toString())).toFixed(decimals);
  } catch { return '0'; }
}

export function parseEth(ethValue) {
  if (!ethValue) return 0n;
  try { return ethers.parseEther(ethValue.toString()); }
  catch { return 0n; }
}

export function shortenAddress(address, chars = 4) {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatDate(timestamp) {
  if (!timestamp) return '';
  const ts = typeof timestamp === 'bigint' ? Number(timestamp) * 1000 : Number(timestamp) * 1000;
  return new Date(ts).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function getTimeRemaining(deadline) {
  if (!deadline) return { expired: true, text: 'No deadline' };
  const deadlineMs = typeof deadline === 'bigint' ? Number(deadline) * 1000 : Number(deadline) * 1000;
  const diff = deadlineMs - Date.now();
  if (diff <= 0) return { expired: true, text: 'Expired' };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return { expired: false, text: `${days}d ${hours}h remaining` };
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return { expired: false, text: `${hours}h ${minutes}m remaining` };
  return { expired: false, text: `${minutes}m remaining` };
}

export function isDeadlinePassed(deadline) {
  if (!deadline) return false;
  const deadlineMs = typeof deadline === 'bigint' ? Number(deadline) * 1000 : Number(deadline) * 1000;
  return Date.now() > deadlineMs;
}

export function calculateSecurityHold(amountWei) {
  const amount = BigInt(amountWei.toString());
  return (amount * 500n) / 10000n;
}

export function calculateTotalWithHold(amountWei) {
  const amount = BigInt(amountWei.toString());
  return amount + calculateSecurityHold(amount);
}

export function getStatusLabel(status) { return StatusLabels[status] || 'Unknown'; }
export function getStatusColor(status) { return StatusColors[status] || StatusColors[4]; }
export function isValidAddress(address) { try { return ethers.isAddress(address); } catch { return false; } }
export function addressesEqual(a, b) { return a?.toLowerCase() === b?.toLowerCase(); }

export async function copyToClipboard(text) {
  try { await navigator.clipboard.writeText(text); return true; }
  catch { return false; }
}

export function truncateText(text, maxLength = 100) {
  if (!text) return '';
  return text.length <= maxLength ? text : text.slice(0, maxLength) + '...';
}

export const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export default {
  JobStatus, StatusLabels, StatusColors, formatEth, parseEth, shortenAddress, formatDate,
  getTimeRemaining, isDeadlinePassed, calculateSecurityHold, calculateTotalWithHold,
  getStatusLabel, getStatusColor, isValidAddress, addressesEqual, copyToClipboard, truncateText, sleep,
};