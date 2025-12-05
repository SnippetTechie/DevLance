// src/components/JobCard.jsx
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import { StatusBadge } from './Badge';
import GlassCard from './GlassCard';

export default function JobCard({ job, showActions = true }) {
  const {
    jobId,
    client,
    developer,
    amount,
    securityHold,
    deadline,
    status,
    ipfsCID,
    metadata,
  } = job;

  // Get metadata fields
  const title = metadata?.title || `Job #${jobId}`;
  const description = metadata?.description || 'No description available';
  const skills = metadata?.skills || [];

  // Format amount
  const amountEth = amount ? parseFloat(ethers.formatEther(amount.toString())).toFixed(4) : '0';
  
  // Format deadline
  const deadlineDate = deadline ? new Date(Number(deadline) * 1000) : null;
  const isExpired = deadlineDate && deadlineDate < new Date();
  const timeRemaining = deadlineDate ? getTimeRemaining(deadlineDate) : null;

  // Shorten address
  const shortAddress = (addr) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';

  return (
    <GlassCard 
      hover 
      className={`
        group relative overflow-hidden
        ${status === 2 ? 'ring-2 ring-amber-500/50' : ''}
      `}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {/* Status Badge */}
      <div className="flex items-start justify-between mb-4">
        <StatusBadge status={status} />
        {status === 2 && (
          <span className="flex items-center gap-1 text-xs text-amber-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
            </span>
            Review needed
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-indigo-300 transition-colors">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
        {description}
      </p>

      {/* Skills */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {skills.slice(0, 3).map((skill, index) => (
            <span 
              key={index}
              className="px-2 py-1 text-xs rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
            >
              {skill}
            </span>
          ))}
          {skills.length > 3 && (
            <span className="px-2 py-1 text-xs rounded-lg bg-white/5 text-gray-400">
              +{skills.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-white/10 my-4" />

      {/* Footer Info */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          {/* Budget */}
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-white font-medium">{amountEth} ETH</span>
          </div>

          {/* Deadline */}
          {timeRemaining && (
            <div className={`flex items-center gap-1.5 ${isExpired ? 'text-red-400' : 'text-gray-400'}`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{timeRemaining}</span>
            </div>
          )}
        </div>

        {/* Client */}
        <div className="text-gray-500 text-xs">
          by {shortAddress(client)}
        </div>
      </div>

      {/* Action Link */}
      {showActions && (
        <Link 
          to={`/job/${jobId}`}
          className="absolute inset-0"
          aria-label={`View ${title}`}
        />
      )}
    </GlassCard>
  );
}

function getTimeRemaining(deadline) {
  const now = new Date();
  const diff = deadline - now;

  if (diff <= 0) return 'Expired';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h`;

  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${minutes}m`;
}

export function JobCardSkeleton() {
  return (
    <GlassCard>
      <div className="animate-pulse">
        <div className="h-6 w-24 bg-white/10 rounded-lg mb-4" />
        <div className="h-6 w-3/4 bg-white/10 rounded-lg mb-2" />
        <div className="h-4 w-full bg-white/10 rounded-lg mb-2" />
        <div className="h-4 w-2/3 bg-white/10 rounded-lg mb-4" />
        <div className="flex gap-2 mb-4">
          <div className="h-6 w-16 bg-white/10 rounded-lg" />
          <div className="h-6 w-20 bg-white/10 rounded-lg" />
        </div>
        <div className="border-t border-white/10 my-4" />
        <div className="flex justify-between">
          <div className="h-5 w-24 bg-white/10 rounded-lg" />
          <div className="h-5 w-20 bg-white/10 rounded-lg" />
        </div>
      </div>
    </GlassCard>
  );
}