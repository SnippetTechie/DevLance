// src/components/EmptyState.jsx
import { Link } from 'react-router-dom';
import Button from './Button';

export default function EmptyState({
  icon,
  title,
  description,
  action,
  actionLabel,
  actionLink,
  className = '',
}) {
  const DefaultIcon = () => (
    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  );

  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 mb-6">
        {icon || <DefaultIcon />}
      </div>
      
      <h3 className="text-xl font-semibold text-white mb-2">
        {title || 'Nothing here yet'}
      </h3>
      
      {description && (
        <p className="text-gray-400 max-w-sm mb-6">
          {description}
        </p>
      )}

      {(action || actionLink) && (
        actionLink ? (
          <Link to={actionLink}>
            <Button variant="primary">
              {actionLabel || 'Get Started'}
            </Button>
          </Link>
        ) : (
          <Button variant="primary" onClick={action}>
            {actionLabel || 'Get Started'}
          </Button>
        )
      )}
    </div>
  );
}

export function NoJobsFound() {
  return (
    <EmptyState
      icon={
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      }
      title="No jobs found"
      description="There are no jobs matching your criteria. Check back later or adjust your filters."
    />
  );
}

export function NoWalletConnected({ onConnect }) {
  return (
    <EmptyState
      icon={
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      }
      title="Connect your wallet"
      description="Please connect your wallet to view your dashboard and interact with jobs."
      action={onConnect}
      actionLabel="Connect Wallet"
    />
  );
}