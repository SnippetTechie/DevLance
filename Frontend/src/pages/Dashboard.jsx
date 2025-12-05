// src/pages/Dashboard.jsx
import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import Header from '../components/Header';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import JobCard, { JobCardSkeleton } from '../components/JobCard';
import StatsCard, { StatsGrid } from '../components/StatsCard';
import { SubmissionPendingBanner } from '../components/NotificationBanner';
import { NoWalletConnected, NoJobsFound } from '../components/EmptyState';
import ReviewModal from '../components/ReviewModal';
import { useWallet } from '../context/WalletContext';
import useOnchainJobs from '../hooks/useOnchainJobs';

const statusFilters = [
  { value: 'all', label: 'All Jobs' },
  { value: 'open', label: 'Open', status: 0 },
  { value: 'progress', label: 'In Progress', status: 1 },
  { value: 'submitted', label: 'Submitted', status: 2 },
  { value: 'completed', label: 'Completed', status: 3 },
  { value: 'cancelled', label: 'Cancelled', status: 4 },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { account, isConnected, connect } = useWallet();
  const { jobs, loading, refresh } = useOnchainJobs({ ownerAddress: account });

  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Fetch on mount and when account changes
  useEffect(() => {
    if (account) {
      refresh();
    }
  }, [account]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = jobs.length;
    const open = jobs.filter(j => j.status === 0).length;
    const active = jobs.filter(j => j.status === 1).length;
    const submitted = jobs.filter(j => j.status === 2).length;
    const completed = jobs.filter(j => j.status === 3).length;

    // Calculate total spent (completed jobs)
    const totalSpent = jobs
      .filter(j => j.status === 3)
      .reduce((sum, j) => sum + BigInt(j.originalAmount?.toString() || 0), 0n);

    return { total, open, active, submitted, completed, totalSpent };
  }, [jobs]);

  // Filter jobs
  const filteredJobs = useMemo(() => {
    if (activeFilter === 'all') return jobs;
    const filter = statusFilters.find(f => f.value === activeFilter);
    if (!filter || filter.status === undefined) return jobs;
    return jobs.filter(j => j.status === filter.status);
  }, [jobs, activeFilter]);

  // Jobs pending review (status === 2)
  const pendingReview = jobs.filter(j => j.status === 2);

  const handleReviewClick = (job) => {
    setSelectedJob(job);
    setShowReviewModal(true);
  };

  const handleReviewSuccess = () => {
    refresh();
    setShowReviewModal(false);
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
              <h1 className="text-3xl font-bold text-white mb-1">Client Dashboard</h1>
              <p className="text-gray-400">Manage your posted jobs and review submissions</p>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/freelancer">
                <Button variant="secondary" size="sm">
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  Switch to Freelancer
                </Button>
              </Link>
              <Link to="/create-gig">
                <Button variant="primary">
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create New Gig
                </Button>
              </Link>
            </div>
          </div>

          {/* Notification Banner */}
          {pendingReview.length > 0 && (
            <div className="mb-6">
              <SubmissionPendingBanner 
                count={pendingReview.length}
                onClick={() => setActiveFilter('submitted')}
              />
            </div>
          )}

          {/* Stats Grid */}
          <StatsGrid className="mb-8">
            <StatsCard
              title="Total Jobs Posted"
              value={stats.total}
              variant="primary"
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              }
            />
            <StatsCard
              title="Open Jobs"
              value={stats.open}
              variant="success"
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <StatsCard
              title="Pending Review"
              value={stats.submitted}
              variant="warning"
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              }
            />
            <StatsCard
              title="Completed"
              value={stats.completed}
              subtitle={stats.totalSpent > 0n ? `${parseFloat(ethers.formatEther(stats.totalSpent)).toFixed(4)} ETH spent` : undefined}
              variant="info"
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </StatsGrid>

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
                {filter.value === 'submitted' && stats.submitted > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-amber-500 text-white">
                    {stats.submitted}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Jobs Grid */}
          {loading && jobs.length === 0 ? (
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
                  {/* Review button overlay for submitted jobs */}
                  {job.status === 2 && (
                    <div className="absolute inset-0 flex items-end p-4">
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleReviewClick(job);
                        }}
                      >
                        Review Submission
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <GlassCard>
              <NoJobsFound />
              {activeFilter === 'all' && (
                <div className="text-center pb-6">
                  <Link to="/create-gig">
                    <Button variant="primary">
                      Create Your First Gig
                    </Button>
                  </Link>
                </div>
              )}
            </GlassCard>
          )}
        </div>
      </main>

      {/* Review Modal */}
      {selectedJob && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedJob(null);
          }}
          job={selectedJob}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
}