// src/services/contract.js
import { ethers } from 'ethers';
import abi from '../contracts/devlance.abi.json';

const CONTRACT_ADDRESS = import.meta.env.VITE_ESCROW_CONTRACT_ADDRESS;
const SECURITY_HOLD_BPS = 500;
const BASIS_POINTS = 10000;

export const JobStatus = { Open: 0, InProgress: 1, Submitted: 2, Completed: 3, Cancelled: 4 };

export function getReadOnlyContract() {
  if (!CONTRACT_ADDRESS) throw new Error('VITE_ESCROW_CONTRACT_ADDRESS not set');
  const provider = typeof window !== 'undefined' && window.ethereum
    ? new ethers.BrowserProvider(window.ethereum)
    : new ethers.JsonRpcProvider('https://rpc.sepolia.org');
  return new ethers.Contract(CONTRACT_ADDRESS, abi, provider);
}

export async function getWritableContract(signer) {
  if (!CONTRACT_ADDRESS) throw new Error('VITE_ESCROW_CONTRACT_ADDRESS not set');
  if (!signer) throw new Error('Signer required');
  return new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
}

export function calculateSecurityHold(amountWei) {
  const amount = BigInt(amountWei);
  return (amount * BigInt(SECURITY_HOLD_BPS)) / BigInt(BASIS_POINTS);
}

export function calculateTotalWithSecurityHold(amountWei) {
  const amount = BigInt(amountWei);
  return amount + calculateSecurityHold(amount);
}

export async function createGig(signer, ipfsCID, amountWei, deadlineDays) {
  if (!ipfsCID?.trim()) throw new Error('IPFS CID required');
  if (!amountWei || BigInt(amountWei) <= 0n) throw new Error('Amount must be > 0');
  if (!deadlineDays || deadlineDays < 1 || deadlineDays > 365) throw new Error('Deadline 1-365 days');

  const contract = await getWritableContract(signer);
  const amount = BigInt(amountWei);
  const totalRequired = calculateTotalWithSecurityHold(amount);

  const tx = await contract.createGig(ipfsCID, amount, deadlineDays, { value: totalRequired });
  const receipt = await tx.wait();

  let jobId = null;
  for (const log of receipt.logs) {
    try {
      const parsed = contract.interface.parseLog({ topics: log.topics, data: log.data });
      if (parsed?.name === 'JobCreated') { jobId = Number(parsed.args.jobId); break; }
    } catch {}
  }
  return { tx, receipt, jobId };
}

export async function acceptJob(signer, jobId) {
  const contract = await getWritableContract(signer);
  const tx = await contract.acceptJob(jobId);
  return { tx, receipt: await tx.wait() };
}

export async function submitWork(signer, jobId, submission) {
  if (!submission?.trim()) throw new Error('Submission required');
  const contract = await getWritableContract(signer);
  const tx = await contract.submitWork(jobId, submission);
  return { tx, receipt: await tx.wait() };
}

export async function releaseFullPayment(signer, jobId) {
  const contract = await getWritableContract(signer);
  const tx = await contract.releaseFullPayment(jobId);
  return { tx, receipt: await tx.wait() };
}

export async function releasePartialPayment(signer, jobId, amountToDeveloper) {
  if (!amountToDeveloper || BigInt(amountToDeveloper) <= 0n) throw new Error('Amount must be > 0');
  const contract = await getWritableContract(signer);
  const tx = await contract.releasePartialPayment(jobId, amountToDeveloper);
  return { tx, receipt: await tx.wait() };
}

export async function cancelJob(signer, jobId) {
  const contract = await getWritableContract(signer);
  const tx = await contract.cancelJob(jobId);
  return { tx, receipt: await tx.wait() };
}

export async function getJob(jobId) {
  const contract = getReadOnlyContract();
  const raw = await contract.getJob(jobId);
  return {
    jobId: Number(raw.id ?? raw[0]),
    client: raw.client ?? raw[1],
    developer: raw.developer ?? raw[2],
    amount: BigInt((raw.amount ?? raw[3]).toString()),
    securityHold: BigInt((raw.securityHold ?? raw[4]).toString()),
    originalAmount: BigInt((raw.originalAmount ?? raw[5]).toString()),
    ipfsCID: raw.ipfsCID ?? raw[6],
    submission: raw.submission ?? raw[7],
    deadline: BigInt((raw.deadline ?? raw[8]).toString()),
    status: Number(raw.status ?? raw[9]),
  };
}

export async function getNextJobId() {
  const contract = getReadOnlyContract();
  return Number(await contract.nextJobId());
}

export function getContractConstants() {
  return { SECURITY_HOLD_BPS, BASIS_POINTS, SECURITY_HOLD_PERCENTAGE: 5, CONTRACT_ADDRESS };
}

export default {
  JobStatus, getReadOnlyContract, getWritableContract, calculateSecurityHold,
  calculateTotalWithSecurityHold, createGig, acceptJob, submitWork,
  releaseFullPayment, releasePartialPayment, cancelJob, getJob, getNextJobId, getContractConstants,
};