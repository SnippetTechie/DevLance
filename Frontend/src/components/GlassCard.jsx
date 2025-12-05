// src/components/GlassCard.jsx

export default function GlassCard({ 
  children, 
  className = '', 
  hover = false,
  glow = false,
  padding = 'p-6',
  ...props 
}) {
  return (
    <div 
      className={`
        relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl
        ${padding}
        ${hover ? 'hover:bg-white/[0.07] hover:border-white/20 transition-all cursor-pointer' : ''}
        ${glow ? 'shadow-lg shadow-indigo-500/10' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

export function GlassCardHeader({ children, className = '' }) {
  return (
    <div className={`mb-6 ${className}`}>
      {children}
    </div>
  );
}

export function GlassCardTitle({ children, className = '' }) {
  return (
    <h3 className={`text-xl font-semibold text-white ${className}`}>
      {children}
    </h3>
  );
}

export function GlassCardDescription({ children, className = '' }) {
  return (
    <p className={`text-gray-400 mt-1 ${className}`}>
      {children}
    </p>
  );
}

export function GlassCardContent({ children, className = '' }) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

export function GlassCardFooter({ children, className = '' }) {
  return (
    <div className={`mt-6 pt-6 border-t border-white/10 ${className}`}>
      {children}
    </div>
  );
}