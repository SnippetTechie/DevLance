// src/components/StatsCard.jsx
import GlassCard from './GlassCard';

export default function StatsCard({ 
  title, 
  value, 
  subtitle,
  icon,
  trend,
  trendValue,
  variant = 'default',
  className = '' 
}) {
  const variants = {
    default: 'from-gray-500/20 to-gray-600/20',
    primary: 'from-indigo-500/20 to-purple-500/20',
    success: 'from-emerald-500/20 to-teal-500/20',
    warning: 'from-amber-500/20 to-orange-500/20',
    info: 'from-blue-500/20 to-cyan-500/20',
  };

  const iconColors = {
    default: 'text-gray-400',
    primary: 'text-indigo-400',
    success: 'text-emerald-400',
    warning: 'text-amber-400',
    info: 'text-blue-400',
  };

  return (
    <GlassCard className={`relative overflow-hidden ${className}`}>
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${variants[variant]} opacity-50`} />
      
      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">{title}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          
          {icon && (
            <div className={`p-3 rounded-xl bg-white/5 ${iconColors[variant]}`}>
              {icon}
            </div>
          )}
        </div>

        {trend && (
          <div className={`flex items-center gap-1 mt-3 text-sm ${
            trend === 'up' ? 'text-emerald-400' : 
            trend === 'down' ? 'text-red-400' : 
            'text-gray-400'
          }`}>
            {trend === 'up' ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            ) : trend === 'down' ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            ) : null}
            <span>{trendValue}</span>
          </div>
        )}
      </div>
    </GlassCard>
  );
}

export function StatsGrid({ children, className = '' }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {children}
    </div>
  );
}