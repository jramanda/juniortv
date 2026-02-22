import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Favorites from './components/Favorites';
import Signals from './components/Signals';
import { Toaster } from './components/ui/toaster';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [favorites, setFavorites] = useState({
    matches: [],
    leagues: [],
  });

  // Load favorites from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('favorites');
    if (stored) {
      setFavorites(JSON.parse(stored));
    }
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (matchId) => {
    setFavorites((prev) => {
      const newMatches = prev.matches?.includes(matchId)
        ? prev.matches.filter((id) => id !== matchId)
        : [...(prev.matches || []), matchId];
      return { ...prev, matches: newMatches };
    });
  };

  return (
    <div className="App min-h-screen bg-gradient-to-br from-[#08252b] to-[#0a2f35]">
      <Header />
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      <main>
        {activeTab === 'dashboard' && (
          <Dashboard favorites={favorites} onToggleFavorite={toggleFavorite} />
        )}
        {activeTab === 'favorites' && (
          <Favorites favorites={favorites} onToggleFavorite={toggleFavorite} />
        )}
        {activeTab === 'signals' && <Signals />}
      </main>

      <Toaster />
    </div>
  );
}

export default App;