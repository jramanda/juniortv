import React, { useState } from 'react';
import { mockMatches, mockLeagues } from '../mocks/mockData';
import MatchCard from './MatchCard';
import { Button } from './ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

const Dashboard = ({ favorites, onToggleFavorite }) => {
  const [expandedLeagues, setExpandedLeagues] = useState(new Set([1, 2]));
  const [filter, setFilter] = useState('all'); // all, live, scheduled

  const toggleLeague = (leagueId) => {
    const newExpanded = new Set(expandedLeagues);
    if (newExpanded.has(leagueId)) {
      newExpanded.delete(leagueId);
    } else {
      newExpanded.add(leagueId);
    }
    setExpandedLeagues(newExpanded);
  };

  const getFilteredMatches = () => {
    if (filter === 'live') return mockMatches.filter(m => m.status === 'LIVE');
    if (filter === 'scheduled') return mockMatches.filter(m => m.status === 'SCHEDULED');
    return mockMatches;
  };

  const groupedMatches = getFilteredMatches().reduce((acc, match) => {
    if (!acc[match.leagueId]) {
      acc[match.leagueId] = [];
    }
    acc[match.leagueId].push(match);
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Stats Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-900/50 to-purple-700/30 border border-purple-500/30 rounded-lg p-4">
          <div className="text-3xl font-bold text-white">{mockMatches.length}</div>
          <div className="text-sm text-purple-300">Total de Jogos</div>
        </div>
        <div className="bg-gradient-to-br from-red-900/50 to-red-700/30 border border-red-500/30 rounded-lg p-4">
          <div className="text-3xl font-bold text-white">
            {mockMatches.filter(m => m.status === 'LIVE').length}
          </div>
          <div className="text-sm text-red-300">Ao Vivo</div>
        </div>
        <div className="bg-gradient-to-br from-emerald-900/50 to-emerald-700/30 border border-emerald-500/30 rounded-lg p-4">
          <div className="text-3xl font-bold text-white">
            {mockMatches.filter(m => m.probability >= 80).length}
          </div>
          <div className="text-sm text-emerald-300">Alta Probabilidade</div>
        </div>
        <div className="bg-gradient-to-br from-blue-900/50 to-blue-700/30 border border-blue-500/30 rounded-lg p-4">
          <div className="text-3xl font-bold text-white">{mockLeagues.length}</div>
          <div className="text-sm text-blue-300">Ligas</div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={() => setFilter('all')}
          variant={filter === 'all' ? 'default' : 'outline'}
          className={filter === 'all' ? 'bg-emerald-600 hover:bg-emerald-700' : 'border-[#1a4f57] text-gray-400 hover:text-white'}
        >
          Todos
        </Button>
        <Button
          onClick={() => setFilter('live')}
          variant={filter === 'live' ? 'default' : 'outline'}
          className={filter === 'live' ? 'bg-red-600 hover:bg-red-700' : 'border-[#1a4f57] text-gray-400 hover:text-white'}
        >
          Ao Vivo
        </Button>
        <Button
          onClick={() => setFilter('scheduled')}
          variant={filter === 'scheduled' ? 'default' : 'outline'}
          className={filter === 'scheduled' ? 'bg-blue-600 hover:bg-blue-700' : 'border-[#1a4f57] text-gray-400 hover:text-white'}
        >
          Agendados
        </Button>
      </div>

      {/* Matches by League */}
      <div className="space-y-4">
        {mockLeagues.map((league) => {
          const leagueMatches = groupedMatches[league.id] || [];
          if (leagueMatches.length === 0) return null;

          const isExpanded = expandedLeagues.has(league.id);
          const liveCount = leagueMatches.filter(m => m.status === 'LIVE').length;

          return (
            <div key={league.id} className="space-y-3">
              {/* League Header */}
              <button
                onClick={() => toggleLeague(league.id)}
                className="w-full bg-[#0d3d45] border border-[#1a4f57] rounded-lg p-4 hover:border-emerald-500/50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{league.flag}</span>
                  <div className="text-left">
                    <h3 className="text-white font-semibold group-hover:text-emerald-400 transition-colors">
                      {league.name}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {leagueMatches.length} {leagueMatches.length === 1 ? 'jogo' : 'jogos'}
                      {liveCount > 0 && (
                        <span className="text-red-500 ml-2">• {liveCount} ao vivo</span>
                      )}
                    </p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {/* Matches */}
              {isExpanded && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {leagueMatches.map((match) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      isFavorite={favorites.matches?.includes(match.id)}
                      onToggleFavorite={onToggleFavorite}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;