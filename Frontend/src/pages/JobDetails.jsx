import React from 'react'
// src/pages/JobDetails.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ethers } from 'ethers';
import Header from '../components/Header';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import { StatusBadge } from '../components/Badge';
import { PageLoader } from '../components/Loader';
import SubmitWorkModal from '../components/SubmitWorkModal';
import ReviewModal from '../components/ReviewModal';
import { useWallet } from '../context/WalletContext';
import { useToast } from '../context/ToastContext';
import { getJob, acceptJob, cancelJob } from '../services/contract';
import { fetchFromIPFS, getExplorerAddressUrl } from '../services/api';

export default function JobDetails() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { account, signer, isConnected, connect } = useWallet();
  const toast = useToast();

  const [job, setJob] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Fetch job data
  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      try {
        const jobData = await getJob(Number(jobId));
        setJob(jobData);

        // Fetch IPFS metadata
        if (jobData.ipfsCID) {
          const meta = await fetchFromIPFS(jobData.ipfsCID);
          setMetadata(meta);
        }
      } catch (error) {
        console.error('Failed to fetch job:', error);
        toast.error('Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  // Helpers
  const shortAddress = (addr) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';
  const isClient = account && job?.client?.toLowerCase() === account.toLowerCase();
  const isDeveloper = account && job?.developer?.toLowerCase() === account.toLowerCase();
  const isZeroAddress = (addr) => !addr || addr === ethers.ZeroAddress;

  // Calculate amounts
  const amount = job?.amount ? BigInt(job.amount.toString()) : 0n;
  const securityHold = job?.securityHold ? BigInt(job.securityHold.toString()) : 0n;
  const totalAmount = amount + securityHold;

  const amountEth = ethers.formatEther(amount.toString());
  const securityHoldEth = ethers.formatEther(securityHold.toString());
  const totalEth = ethers.formatEther(totalAmount.toString());

  // Format deadline
  const deadlineDate = job?.deadline ? new Date(Number(job.deadline) * 1000) : null;
  const isExpired = deadlineDate && deadlineDate < new Date();

  // Handle Accept Job
  const handleAcceptJob = async () => {
    if (!isConnected) {
      const connected = await connect();
      if (!connected) {
        toast.error('Please connect your wallet');
        return;
      }
    }

    if (isClient) {
      toast.error('You cannot accept your own job');
      return;
    }

    setActionLoading(true);
    try {
      toast.info('Please confirm the transaction in MetaMask...');
      await acceptJob(signer, Number(jobId));
      toast.success('Job accepted successfully!');
      
      // Refresh job data
      const updatedJob = await getJob(Number(jobId));
      setJob(updatedJob);
    } catch (error) {
      console.error('Accept job error:', error);
      toast.error(error.message || 'Failed to accept job');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Cancel Job
  const handleCancelJob = async () => {
    if (!isConnected) {
      const connected = await connect();
      if (!connected) {
        toast.error('Please connect your wallet');
        return;
      }
    }

    setActionLoading(true);
    try {
      toast.info('Please confirm the transaction in MetaMask...');
      await cancelJob(signer, Number(jobId));
      toast.success('Job cancelled. Funds refunded.');
      navigate('/dashboard');
    } catch (error) {
      console.error('Cancel job error:', error);
      toast.error(error.message || 'Failed to cancel job');
    } finally {
      setActionLoading(false);
    }
  };

  // Refresh after modal actions
  const handleModalSuccess = async () => {
    const updatedJob = await getJob(Number(jobId));
    setJob(updatedJob);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950">
        
        <Header />
        <main className="relative z-10 pt-20 pb-16 px-4">
          <PageLoader message="Loading job details..." />
        </main>
      </div>
    );
  }

  if (!job || !job.client || job.client === ethers.ZeroAddress) {
    return (
      <div className="min-h-screen bg-slate-950">
        
        <Header />
        <main className="relative z-10 pt-20 pb-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Job Not Found</h1>
            <p className="text-gray-400 mb-6">This job doesn't exist or has been removed.</p>
            <Link to="/marketplace">
              <Button variant="primary">Browse Marketplace</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      
      <Header />

      <main className="relative z-10 pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link 
            to="/marketplace" 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Marketplace
          </Link>

          {/* Main Card */}
          <GlassCard className="mb-6">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <StatusBadge status={job.status} size="lg" />
                  {isExpired && job.status < 3 && (
                    <span className="px-2 py-1 text-xs rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">
                      Deadline Passed
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  {metadata?.title || `Job #${jobId}`}
                </h1>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Job ID</p>
                <p className="text-white font-mono">#{jobId}</p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Description</h3>
              <p className="text-gray-300 whitespace-pre-wrap">
                {metadata?.description || 'No description available'}
              </p>
            </div>

            {/* Skills */}
            {metadata?.skills?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {metadata.skills.map((skill, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1.5 text-sm rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-white/10 my-6" />

            {/* Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-white/5">
                <p className="text-xs text-gray-500 mb-1">Budget</p>
                <p className="text-xl font-bold text-white">{parseFloat(amountEth).toFixed(4)} ETH</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5">
                <p className="text-xs text-gray-500 mb-1">Security Hold (5%)</p>
                <p className="text-xl font-bold text-indigo-400">{parseFloat(securityHoldEth).toFixed(4)} ETH</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5">
                <p className="text-xs text-gray-500 mb-1">Total in Escrow</p>
                <p className="text-xl font-bold text-emerald-400">{parseFloat(totalEth).toFixed(4)} ETH</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5">
                <p className="text-xs text-gray-500 mb-1">Deadline</p>
                <p className={`text-lg font-semibold ${isExpired ? 'text-red-400' : 'text-white'}`}>
                  {deadlineDate ? deadlineDate.toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>

            {/* Parties */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs text-gray-500 mb-2">Client</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <a 
                    href={getExplorerAddressUrl(job.client)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white font-mono hover:text-indigo-400 transition-colors"
                  >
                    {shortAddress(job.client)}
                  </a>
                  {isClient && (
                    <span className="px-2 py-0.5 text-xs rounded bg-indigo-500/20 text-indigo-400">You</span>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs text-gray-500 mb-2">Developer</p>
                {isZeroAddress(job.developer) ? (
                  <p className="text-gray-500 italic">Not assigned yet</p>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                    </div>
                    <a 
                      href={getExplorerAddressUrl(job.developer)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white font-mono hover:text-indigo-400 transition-colors"
                    >
                      {shortAddress(job.developer)}
                    </a>
                    {isDeveloper && (
                      <span className="px-2 py-0.5 text-xs rounded bg-emerald-500/20 text-emerald-400">You</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Submission (if exists) */}
            {job.submission && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-6">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div>
                    <p className="text-amber-300 font-medium">Work Submitted</p>
                    <p className="text-gray-400 text-sm mt-1">
                      IPFS: {job.submission.slice(0, 20)}...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {/* Open Job - Anyone can accept (except client) */}
              {job.status === 0 && !isClient && (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleAcceptJob}
                  loading={actionLoading}
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                >
                  {isConnected ? 'Accept Job' : 'Connect Wallet & Accept'}
                </Button>
              )}

              {/* Open Job - Client can cancel */}
              {job.status === 0 && isClient && (
                <Button
                  variant="danger"
                  size="lg"
                  onClick={handleCancelJob}
                  loading={actionLoading}
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  }
                >
                  Cancel Job
                </Button>
              )}

              {/* In Progress - Developer can submit work */}
              {job.status === 1 && isDeveloper && (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setShowSubmitModal(true)}
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  }
                >
                  Submit Work
                </Button>
              )}

              {/* Submitted - Client can review */}
              {job.status === 2 && isClient && (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setShowReviewModal(true)}
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  }
                >
                  Review Submission
                </Button>
              )}

              {/* Completed/Cancelled Status */}
              {job.status === 3 && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/20 text-purple-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Job Completed - Payment Released
                </div>
              )}

              {job.status === 4 && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-500/20 text-gray-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Job Cancelled
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </main>

      {/* Modals */}
      <SubmitWorkModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        job={{ ...job, metadata }}
        onSuccess={handleModalSuccess}
      />

      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        job={{ ...job, metadata }}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}