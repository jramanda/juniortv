import React from 'react';
import { mockSignals } from '../mocks/mockData';
import SignalCard from './SignalCard';
import { TrendingUp, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

const Signals = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-emerald-400" />
          <h2 className="text-2xl font-bold text-white">Sinais de Alta Probabilidade</h2>
        </div>
        <p className="text-gray-400">
          Análises baseadas em médias e prognósticos de gols
        </p>
      </div>

      {/* Info Alert */}
      <Alert className="bg-blue-500/10 border-blue-500/30 text-white">
        <Info className="h-4 w-4 text-blue-400" />
        <AlertTitle className="text-blue-400">Como funcionam os sinais?</AlertTitle>
        <AlertDescription className="text-gray-300">
          Nosso algoritmo analisa médias de gols, histórico de confrontos, estatísticas recentes e
          outros dados para identificar partidas com alta probabilidade de gols. Configure seu
          Telegram Bot para receber notificações automáticas.
        </AlertDescription>
      </Alert>

      {/* Signals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mockSignals.map((signal) => (
          <SignalCard key={signal.id} signal={signal} />
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="bg-[#0d3d45] border border-emerald-500/30 rounded-lg p-6 text-center">
          <div className="text-4xl font-bold text-emerald-400">
            {mockSignals.filter(s => s.probability >= 80).length}
          </div>
          <div className="text-sm text-gray-400 mt-2">Sinais acima de 80%</div>
        </div>
        <div className="bg-[#0d3d45] border border-yellow-500/30 rounded-lg p-6 text-center">
          <div className="text-4xl font-bold text-yellow-400">
            {mockSignals.filter(s => s.probability >= 60 && s.probability < 80).length}
          </div>
          <div className="text-sm text-gray-400 mt-2">Sinais entre 60-79%</div>
        </div>
        <div className="bg-[#0d3d45] border border-[#1a4f57] rounded-lg p-6 text-center">
          <div className="text-4xl font-bold text-white">{mockSignals.length}</div>
          <div className="text-sm text-gray-400 mt-2">Total de sinais ativos</div>
        </div>
      </div>
    </div>
  );
};

export default Signals;