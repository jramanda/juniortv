import { useState } from "react";
import { Check } from "lucide-react";

const LeagueFilter = ({ leagues, selectedLeague, onSelectLeague }) => {
  return (
    <div className="league-filters" data-testid="league-filters">
      <button
        onClick={() => onSelectLeague(null)}
        className={`filter-btn flex items-center gap-2 px-4 py-2 rounded-sm text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-all border ${
          !selectedLeague 
            ? 'active border-green-500/30 bg-green-500/10 text-green-500' 
            : 'border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300'
        }`}
        data-testid="filter-all"
      >
        {!selectedLeague && <Check className="w-3 h-3" />}
        Todas Ligas
      </button>
      
      {leagues.map((league) => (
        <button
          key={league.id}
          onClick={() => onSelectLeague(league.id)}
          className={`filter-btn flex items-center gap-2 px-4 py-2 rounded-sm text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-all border ${
            selectedLeague === league.id 
              ? 'active border-green-500/30 bg-green-500/10 text-green-500' 
              : 'border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300'
          }`}
          data-testid={`filter-${league.id}`}
        >
          {league.logo && (
            <img 
              src={league.logo} 
              alt={league.name}
              className="w-4 h-4 object-contain"
              onError={(e) => e.target.style.display = 'none'}
            />
          )}
          {selectedLeague === league.id && <Check className="w-3 h-3" />}
          {league.name}
        </button>
      ))}
    </div>
  );
};

export default LeagueFilter;
