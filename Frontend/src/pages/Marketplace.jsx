// src/pages/Marketplace.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import JobCard, { JobCardSkeleton } from '../components/JobCard';
import { NoJobsFound } from '../components/EmptyState';
import Button from '../components/Button';
import useOnchainJobs from '../hooks/useOnchainJobs';

export default function Marketplace() {
  const { jobs, loading, error, refresh } = useOnchainJobs();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch jobs on mount
  useEffect(() => {
    refresh();
  }, []);

  // Filter only OPEN jobs (status === 0)
  const openJobs = jobs.filter(job => job.status === 0);

  // Search filter
  const filteredJobs = openJobs.filter(job => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const title = job.metadata?.title?.toLowerCase() || '';
    const description = job.metadata?.description?.toLowerCase() || '';
    const skills = job.metadata?.skills?.join(' ').toLowerCase() || '';
    return title.includes(query) || description.includes(query) || skills.includes(query);
  });

  return (
    <div className="min-h-screen bg-slate-950">
      
      <Header />

      <main className="relative z-10 pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Opportunities</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Discover blockchain-powered freelance jobs. Accept work, deliver results, get paid securely through smart contracts.
            </p>
          </div>

          {/* Search & Stats Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            {/* Search */}
            <div className="relative w-full sm:w-96">
              <svg 
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search jobs by title, description, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
              />
            </div>

            {/* Stats & Refresh */}
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-400">
                <span className="text-white font-semibold">{filteredJobs.length}</span> open jobs
              </div>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={refresh}
                disabled={loading}
                icon={
                  <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                }
              >
                Refresh
              </Button>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Failed to load jobs. Please try again.</span>
              </div>
            </div>
          )}

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
                <JobCard key={job.jobId} job={job} />
              ))}
            </div>
          ) : (
            <NoJobsFound />
          )}

          {/* CTA for Clients */}
          <div className="mt-16 text-center">
            <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
              <div className="text-left">
                <p className="text-white font-semibold">Looking to hire talent?</p>
                <p className="text-gray-400 text-sm">Post a job and find skilled developers.</p>
              </div>
              <Link to="/create-gig">
                <Button variant="primary">
                  Post a Job
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}