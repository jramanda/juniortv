import React, { useState } from 'react';
import { Star, TrendingUp, Activity } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { useToast } from '../hooks/use-toast';

const MatchCard = ({ match, isFavorite, onToggleFavorite }) => {
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();

  const getProbabilityColor = (prob) => {
    if (prob >= 80) return 'text-emerald-400';
    if (prob >= 60) return 'text-yellow-400';
    return 'text-gray-400';
  };

  const getProbabilityBg = (prob) => {
    if (prob >= 80) return 'bg-emerald-500/20';
    if (prob >= 60) return 'bg-yellow-500/20';
    return 'bg-gray-500/20';
  };

  return (
    <>
      <div
        onClick={() => setShowDetails(true)}
        className="bg-[#0d3d45] border border-[#1a4f57] rounded-lg p-4 hover:border-emerald-500/50 transition-all cursor-pointer group hover:shadow-lg hover:shadow-emerald-500/10"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{match.time}</span>
            {match.status === 'LIVE' && (
              <div className="flex items-center gap-1">
                <Activity className="w-3 h-3 text-red-500 animate-pulse" />
                <span className="text-xs text-red-500 font-medium">{match.minute}</span>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(match.id);
            }}
            className="h-8 w-8 hover:bg-[#1a4f57]"
          >
            <Star
              className={`w-4 h-4 transition-colors ${
                isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
              }`}
            />
          </Button>
        </div>

        <div className="space-y-3">
          {/* Home Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-2xl">{match.homeTeam.logo}</span>
              <span className="text-white font-medium group-hover:text-emerald-400 transition-colors">
                {match.homeTeam.name}
              </span>
            </div>
            {match.homeTeam.score !== null && (
              <span className="text-2xl font-bold text-white">{match.homeTeam.score}</span>
            )}
          </div>

          {/* Away Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-2xl">{match.awayTeam.logo}</span>
              <span className="text-white font-medium group-hover:text-emerald-400 transition-colors">
                {match.awayTeam.name}
              </span>
            </div>
            {match.awayTeam.score !== null && (
              <span className="text-2xl font-bold text-white">{match.awayTeam.score}</span>
            )}
          </div>
        </div>

        {/* Probability Badge */}
        {match.probability && (
          <div className={`mt-3 pt-3 border-t border-[#1a4f57] flex items-center justify-between`}>
            <span className="text-xs text-gray-400">Probabilidade de gols</span>
            <div className={`px-3 py-1 rounded-full ${getProbabilityBg(match.probability)}`}>
              <span className={`text-sm font-bold ${getProbabilityColor(match.probability)}`}>
                {match.probability}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Match Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="bg-[#0a2f35] border-[#1a4f57] text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl text-white">
              {match.homeTeam.name} vs {match.awayTeam.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Score */}
            <div className="flex items-center justify-center gap-8 py-6 bg-[#0d3d45] rounded-lg">
              <div className="text-center">
                <div className="text-4xl mb-2">{match.homeTeam.logo}</div>
                <div className="text-2xl font-bold text-white">
                  {match.homeTeam.score ?? '-'}
                </div>
                <div className="text-sm text-gray-400 mt-1">{match.homeTeam.name}</div>
              </div>
              <div className="text-2xl text-gray-500">:</div>
              <div className="text-center">
                <div className="text-4xl mb-2">{match.awayTeam.logo}</div>
                <div className="text-2xl font-bold text-white">
                  {match.awayTeam.score ?? '-'}
                </div>
                <div className="text-sm text-gray-400 mt-1">{match.awayTeam.name}</div>
              </div>
            </div>

            {/* Stats */}
            {match.stats && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Estatísticas</h3>
                
                {/* Possession */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white">{match.stats.possession.home}%</span>
                    <span className="text-gray-400">Posse de bola</span>
                    <span className="text-white">{match.stats.possession.away}%</span>
                  </div>
                  <div className="flex gap-1 h-2">
                    <div
                      className="bg-emerald-500 rounded-l"
                      style={{ width: `${match.stats.possession.home}%` }}
                    />
                    <div
                      className="bg-blue-500 rounded-r"
                      style={{ width: `${match.stats.possession.away}%` }}
                    />
                  </div>
                </div>

                {/* Other Stats */}
                {[
                  { label: 'Finalizações', key: 'shots' },
                  { label: 'Finalizações no gol', key: 'shotsOnTarget' },
                  { label: 'Escanteios', key: 'corners' },
                  { label: 'Faltas', key: 'fouls' },
                ].map((stat) => (
                  <div key={stat.key} className="flex justify-between text-sm py-2 border-b border-[#1a4f57] last:border-0">
                    <span className="text-white font-medium">{match.stats[stat.key].home}</span>
                    <span className="text-gray-400">{stat.label}</span>
                    <span className="text-white font-medium">{match.stats[stat.key].away}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Probability */}
            {match.probability && (
              <div className={`p-4 rounded-lg ${getProbabilityBg(match.probability)} border border-emerald-500/30`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    <span className="text-white font-medium">Alta probabilidade de gols</span>
                  </div>
                  <span className={`text-2xl font-bold ${getProbabilityColor(match.probability)}`}>
                    {match.probability}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MatchCard;