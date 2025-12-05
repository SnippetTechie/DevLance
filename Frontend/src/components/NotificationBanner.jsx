// src/components/NotificationBanner.jsx
import { Link } from 'react-router-dom';

export default function NotificationBanner({
  type = 'info',
  title,
  message,
  action,
  actionLabel,
  actionLink,
  onDismiss,
  className = '',
}) {
  const types = {
    info: {
      bg: 'bg-indigo-500/10 border-indigo-500/30',
      icon: 'text-indigo-400',
      title: 'text-indigo-300',
    },
    warning: {
      bg: 'bg-amber-500/10 border-amber-500/30',
      icon: 'text-amber-400',
      title: 'text-amber-300',
    },
    success: {
      bg: 'bg-emerald-500/10 border-emerald-500/30',
      icon: 'text-emerald-400',
      title: 'text-emerald-300',
    },
    danger: {
      bg: 'bg-red-500/10 border-red-500/30',
      icon: 'text-red-400',
      title: 'text-red-300',
    },
  };

  const icons = {
    info: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    success: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    danger: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  const style = types[type];

  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl border backdrop-blur-xl ${style.bg} ${className}`}>
      <div className={`flex-shrink-0 ${style.icon}`}>
        {icons[type]}
      </div>

      <div className="flex-1 min-w-0">
        {title && (
          <p className={`font-medium ${style.title}`}>{title}</p>
        )}
        {message && (
          <p className="text-sm text-gray-400 mt-0.5">{message}</p>
        )}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {actionLink ? (
          <Link
            to={actionLink}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors"
          >
            {actionLabel || 'View'}
          </Link>
        ) : action ? (
          <button
            onClick={action}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors"
          >
            {actionLabel || 'View'}
          </button>
        ) : null}

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export function SubmissionPendingBanner({ count, onClick }) {
  return (
    <NotificationBanner
      type="warning"
      title={`${count} submission${count > 1 ? 's' : ''} pending review`}
      message="A freelancer has submitted work for your review. Take action to release payment."
      action={onClick}
      actionLabel="Review Now"
    />
  );
}