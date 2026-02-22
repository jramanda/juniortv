import React from 'react';
import { Home, Star, TrendingUp, Settings } from 'lucide-react';
import { Button } from './ui/button';

const Navigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'favorites', label: 'Favoritos', icon: Star },
    { id: 'signals', label: 'Sinais', icon: TrendingUp },
  ];

  return (
    <nav className="bg-[#0a2f35] border-b border-[#1a4f57]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant="ghost"
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-3 rounded-none border-b-2 transition-colors
                  ${activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-400 bg-[#0d3d45]'
                    : 'border-transparent text-gray-400 hover:text-white hover:bg-[#0d3d45]'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;