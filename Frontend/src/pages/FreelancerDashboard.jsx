import React from 'react'
// src/pages/FreelancerDashboard.jsx
import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import Header from '../components/Header';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import JobCard, { JobCardSkeleton } from '../components/JobCard';
import StatsCard, { StatsGrid } from '../components/StatsCard';
import { StatusBadge } from '../components/Badge';
import { NoWalletConnected } from '../components/EmptyState';
import SubmitWorkModal from '../components/SubmitWorkModal';
import { useWallet } from '../context/WalletContext';
import useOnchainJobs from '../hooks/useOnchainJobs';

const statusFilters = [
  { value: 'all', label: 'All Jobs' },
  { value: 'progress', label: 'In Progress', status: 1 },
  { value: 'submitted', label: 'Submitted', status: 2 },
  { value: 'completed', label: 'Completed', status: 3 },
  { value: 'cancelled', label: 'Cancelled', status: 4 },
];

export default function FreelancerDashboard() {
  const { account, isConnected, connect } = useWallet();
  const { jobs: allJobs, loading, refresh } = useOnchainJobs();

  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Filter jobs where current user is the developer
  const myJobs = useMemo(() => {
    if (!account) return [];
    return allJobs.filter(job => 
      job.developer && job.developer.toLowerCase() === account.toLowerCase()
    );
  }, [allJobs, account]);

  // Fetch on mount and when account changes
  useEffect(() => {
    if (account) {
      refresh();
    }
  }, [account]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = myJobs.length;
    const active = myJobs.filter(j => j.status === 1).length;
    const submitted = myJobs.filter(j => j.status === 2).length;
    const completed = myJobs.filter(j => j.status === 3).length;
    const cancelled = myJobs.filter(j => j.status === 4).length;

    // Calculate total earned (completed jobs - amount + securityHold)
    const totalEarned = myJobs
      .filter(j => j.status === 3)
      .reduce((sum, j) => {
        const amt = BigInt(j.originalAmount?.toString() || 0);
        return sum + amt;
      }, 0n);

    // Pending earnings (submitted but not yet approved)
    const pendingEarnings = myJobs
      .filter(j => j.status === 2)
      .reduce((sum, j) => {
        const amt = BigInt(j.amount?.toString() || 0);
        const hold = BigInt(j.securityHold?.toString() || 0);
        return sum + amt + hold;
      }, 0n);

    return { total, active, submitted, completed, cancelled, totalEarned, pendingEarnings };
  }, [myJobs]);

  // Filter jobs by status
  const filteredJobs = useMemo(() => {
    if (activeFilter === 'all') return myJobs;
    const filter = statusFilters.find(f => f.value === activeFilter);
    if (!filter || filter.status === undefined) return myJobs;
    return myJobs.filter(j => j.status === filter.status);
  }, [myJobs, activeFilter]);

  const handleSubmitWork = (job) => {
    setSelectedJob(job);
    setShowSubmitModal(true);
  };

  const handleSubmitSuccess = () => {
    refresh();
    setShowSubmitModal(false);
    setSelectedJob(null);
  };

  // Not connected state
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-slate-950">
        
        <Header />
        <main className="relative z-10 pt-20 pb-16 px-4">
          <div className="max-w-2xl mx-auto">
            <NoWalletConnected onConnect={connect} />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      
      <Header />

      <main className="relative z-10 pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Freelancer Dashboard</h1>
              <p className="text-gray-400">Track your accepted jobs and earnings</p>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/dashboard">
                <Button variant="secondary" size="sm">
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  Switch to Client
                </Button>
              </Link>
              <Link to="/marketplace">
                <Button variant="primary">
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Find Work
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <StatsGrid className="mb-8">
            <StatsCard
              title="Active Jobs"
              value={stats.active}
              variant="info"
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              }
            />
            <StatsCard
              title="Awaiting Review"
              value={stats.submitted}
              variant="warning"
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <StatsCard
              title="Completed"
              value={stats.completed}
              variant="success"
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <StatsCard
              title="Total Earned"
              value={`${parseFloat(ethers.formatEther(stats.totalEarned)).toFixed(4)} ETH`}
              subtitle={stats.pendingEarnings > 0n ? `${parseFloat(ethers.formatEther(stats.pendingEarnings)).toFixed(4)} ETH pending` : undefined}
              variant="primary"
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </StatsGrid>

          {/* Active Jobs Alert */}
          {stats.active > 0 && (
            <div className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-blue-300 font-medium">You have {stats.active} active job{stats.active > 1 ? 's' : ''}</p>
                  <p className="text-gray-400 text-sm">Complete and submit your work to get paid.</p>
                </div>
              </div>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            {statusFilters.map(filter => (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={`
                  px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all
                  ${activeFilter === filter.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                  }
                `}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Jobs List */}
          {loading && myJobs.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <JobCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map(job => (
                <div key={job.jobId} className="relative">
                  <JobCard job={job} />
                  {/* Submit Work button for in-progress jobs */}
                  {job.status === 1 && (
                    <div className="absolute inset-0 flex items-end p-4">
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSubmitWork(job);
                        }}
                      >
                        Submit Work
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <GlassCard>
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                  <svg className="w-10 h-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {activeFilter === 'all' ? 'No jobs yet' : 'No jobs in this category'}
                </h3>
                <p className="text-gray-400 max-w-sm mb-6">
                  {activeFilter === 'all' 
                    ? "Browse the marketplace and accept jobs to start earning."
                    : "Try selecting a different filter or browse the marketplace for new opportunities."
                  }
                </p>
                <Link to="/marketplace">
                  <Button variant="primary">
                    Browse Marketplace
                  </Button>
                </Link>
              </div>
            </GlassCard>
          )}

          {/* Earnings Summary */}
          {stats.completed > 0 && (
            <GlassCard className="mt-8">
              <h3 className="text-lg font-semibold text-white mb-4">Earnings Summary</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white/5">
                  <p className="text-xs text-gray-500 mb-1">Jobs Completed</p>
                  <p className="text-2xl font-bold text-white">{stats.completed}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5">
                  <p className="text-xs text-gray-500 mb-1">Total Earned</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    {parseFloat(ethers.formatEther(stats.totalEarned)).toFixed(4)} ETH
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/5">
                  <p className="text-xs text-gray-500 mb-1">Pending Payments</p>
                  <p className="text-2xl font-bold text-amber-400">
                    {parseFloat(ethers.formatEther(stats.pendingEarnings)).toFixed(4)} ETH
                  </p>
                </div>
              </div>
            </GlassCard>
          )}
        </div>
      </main>

      {/* Submit Work Modal */}
      {selectedJob && (
        <SubmitWorkModal
          isOpen={showSubmitModal}
          onClose={() => {
            setShowSubmitModal(false);
            setSelectedJob(null);
          }}
          job={selectedJob}
          onSuccess={handleSubmitSuccess}
        />
      )}
    </div>
  );
}