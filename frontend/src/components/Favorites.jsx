import React from 'react';
import { mockMatches, mockLeagues } from '../mocks/mockData';
import MatchCard from './MatchCard';
import { Star } from 'lucide-react';

const Favorites = ({ favorites, onToggleFavorite }) => {
  const favoriteMatches = mockMatches.filter(match => 
    favorites.matches?.includes(match.id) ||
    favorites.leagues?.includes(match.leagueId)
  );

  if (favoriteMatches.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#0d3d45] rounded-full">
            <Star className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Nenhum favorito adicionado</h2>
          <p className="text-gray-400 max-w-md mx-auto">
            Adicione times e ligas aos favoritos clicando na estrela nos jogos do dashboard
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
        <h2 className="text-2xl font-bold text-white">Meus Favoritos</h2>
        <span className="text-gray-400">({favoriteMatches.length})</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {favoriteMatches.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            isFavorite={true}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </div>
  );
};

export default Favorites;