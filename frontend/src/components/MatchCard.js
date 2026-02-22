import { useState } from "react";
import { Calendar, TrendingUp, Flag, Send, Check } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const MatchCard = ({ match, onSelect, isSelected }) => {
  const matchDate = new Date(match.match_date);
  const formattedDate = matchDate.toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit' 
  });
  const formattedTime = matchDate.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  const getCornerClass = (value) => {
    if (value >= 9) return "high";
    if (value >= 7) return "medium";
    return "low";
  };

  const getProbabilityColor = (prob) => {
    if (prob >= 70) return "high";
    if (prob >= 50) return "medium";
    return "low";
  };

  return (
    <div 
      className={`match-card bg-slate-900/50 border rounded-sm overflow-hidden relative ${
        isSelected ? 'border-green-500/50 bg-green-500/5' : 'border-slate-700/50'
      }`}
      data-testid={`match-card-${match.id}`}
    >
      {/* High Probability Badge */}
      {match.is_high_probability && (
        <div className="absolute top-3 right-3">
          <span className="badge-high-prob animate-pulse-green">
            HIGH PROB
          </span>
        </div>
      )}

      {/* Header - League Info */}
      <div className="px-4 py-3 border-b border-slate-800/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {match.league_logo && (
            <img 
              src={match.league_logo} 
              alt={match.league}
              className="w-5 h-5 object-contain"
              onError={(e) => e.target.style.display = 'none'}
            />
          )}
          <span className="text-xs text-slate-400 uppercase tracking-wider">{match.league}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Calendar className="w-3 h-3" />
          <span className="font-mono">{formattedDate}</span>
          <span className="font-mono text-green-500">{formattedTime}</span>
        </div>
      </div>

      {/* Teams */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <p className="font-bold text-white text-sm mb-1 team-name">{match.home_team.name}</p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Corners:</span>
              <span className={`corner-stat ${getCornerClass(match.home_team.avg_corners_for)}`}>
                {match.home_team.avg_corners_for.toFixed(1)}
              </span>
            </div>
          </div>
          
          <div className="px-4">
            <span className="text-slate-600 text-lg font-bold">VS</span>
          </div>
          
          <div className="flex-1 text-right">
            <p className="font-bold text-white text-sm mb-1 team-name">{match.away_team.name}</p>
            <div className="flex items-center justify-end gap-2 text-xs text-slate-500">
              <span>Corners:</span>
              <span className={`corner-stat ${getCornerClass(match.away_team.avg_corners_for)}`}>
                {match.away_team.avg_corners_for.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Prediction Stats */}
        <div className="bg-slate-950/50 rounded-sm p-3 border border-slate-800/50">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-500 block mb-1">
                Previsao Corners
              </span>
              <span className={`text-2xl font-mono font-bold corner-stat ${getCornerClass(match.predicted_corners)}`}>
                {match.predicted_corners.toFixed(1)}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-500 block mb-1">
                Prob. Over 9
              </span>
              <span className={`text-2xl font-mono font-bold corner-stat ${getProbabilityColor(match.probability_over_9)}`}>
                {match.probability_over_9}%
              </span>
            </div>
          </div>
          
          {/* Probability Bar */}
          <div className="mt-3">
            <div className="prob-bar">
              <div 
                className={`prob-bar-fill ${getProbabilityColor(match.probability_over_9)}`}
                style={{ width: `${match.probability_over_9}%` }}
              />
            </div>
          </div>
        </div>

        {/* Select for Telegram */}
        <div className="mt-3 flex items-center justify-between">
          <button
            onClick={() => onSelect(match.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-sm text-xs font-medium uppercase tracking-wider transition-all ${
              isSelected 
                ? 'bg-green-500/20 text-green-500 border border-green-500/30' 
                : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:border-slate-600'
            }`}
            data-testid={`select-match-${match.id}`}
          >
            {isSelected ? (
              <>
                <Check className="w-3 h-3" />
                <span>Selecionado</span>
              </>
            ) : (
              <>
                <Send className="w-3 h-3" />
                <span>Selecionar</span>
              </>
            )}
          </button>
          
          <div className="flex items-center gap-1 text-[10px] text-slate-600">
            <Flag className="w-3 h-3" />
            <span>{match.country}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchCard;
