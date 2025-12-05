// src/components/Badge.jsx

const statusStyles = {
  0: { // Open
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    dot: 'bg-emerald-400',
    label: 'Open',
  },
  1: { // InProgress
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    dot: 'bg-blue-400',
    label: 'In Progress',
  },
  2: { // Submitted
    bg: 'bg-amber-500/20',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    dot: 'bg-amber-400',
    label: 'Submitted',
  },
  3: { // Completed
    bg: 'bg-purple-500/20',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
    dot: 'bg-purple-400',
    label: 'Completed',
  },
  4: { // Cancelled
    bg: 'bg-gray-500/20',
    text: 'text-gray-400',
    border: 'border-gray-500/30',
    dot: 'bg-gray-400',
    label: 'Cancelled',
  },
};

export default function Badge({ 
  children, 
  variant = 'default',
  size = 'md',
  dot = false,
  className = '' 
}) {
  const variants = {
    default: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    primary: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    danger: 'bg-red-500/20 text-red-400 border-red-500/30',
    info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  return (
    <span 
      className={`
        inline-flex items-center gap-1.5 font-medium rounded-lg border
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${
          variant === 'success' ? 'bg-emerald-400' :
          variant === 'warning' ? 'bg-amber-400' :
          variant === 'danger' ? 'bg-red-400' :
          variant === 'info' ? 'bg-blue-400' :
          variant === 'primary' ? 'bg-indigo-400' :
          'bg-gray-400'
        }`} />
      )}
      {children}
    </span>
  );
}

export function StatusBadge({ status, size = 'md', className = '' }) {
  const style = statusStyles[status] || statusStyles[4];

  return (
    <span 
      className={`
        inline-flex items-center gap-1.5 font-medium rounded-lg border
        ${style.bg} ${style.text} ${style.border}
        ${size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-3 py-1.5 text-sm' : 'px-2.5 py-1 text-xs'}
        ${className}
      `}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot} ${status === 1 ? 'animate-pulse' : ''}`} />
      {style.label}
    </span>
  );
}