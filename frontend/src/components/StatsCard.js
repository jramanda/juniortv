const StatsCard = ({ title, value, subtitle, icon: Icon, highlight }) => {
  return (
    <div className="bg-slate-900/50 border border-slate-700/50 rounded-sm p-4 hover:border-slate-600/50 transition-colors" data-testid={`stats-card-${title.toLowerCase().replace(/\s/g, '-')}`}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-[10px] uppercase tracking-wider text-slate-500">{title}</span>
        {Icon && (
          <div className="w-8 h-8 bg-slate-800/50 rounded-sm flex items-center justify-center">
            <Icon className={`w-4 h-4 ${highlight ? 'text-green-500' : 'text-slate-500'}`} />
          </div>
        )}
      </div>
      <p className={`text-3xl font-mono font-bold stat-value ${highlight ? 'text-green-500 glow-text-green' : 'text-white'}`}>
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
      )}
    </div>
  );
};

export default StatsCard;
