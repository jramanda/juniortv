import React from 'react';
import { TrendingUp, Send, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '../hooks/use-toast';

const SignalCard = ({ signal }) => {
  const { toast } = useToast();

  const handleSendToTelegram = () => {
    const token = localStorage.getItem('telegram_token');
    const chatId = localStorage.getItem('telegram_chat_id');

    if (!token || !chatId) {
      toast({
        title: 'Configuração necessária',
        description: 'Configure seu Telegram Bot nas configurações',
        variant: 'destructive',
      });
      return;
    }

    // Mock do envio
    toast({
      title: 'Sinal enviado!',
      description: `Sinal enviado para o Telegram com sucesso`,
    });
  };

  const getProbabilityColor = (prob) => {
    if (prob >= 80) return 'text-emerald-400';
    if (prob >= 60) return 'text-yellow-400';
    return 'text-gray-400';
  };

  const getProbabilityBg = (prob) => {
    if (prob >= 80) return 'bg-emerald-500/20 border-emerald-500/30';
    if (prob >= 60) return 'bg-yellow-500/20 border-yellow-500/30';
    return 'bg-gray-500/20 border-gray-500/30';
  };

  return (
    <div className={`bg-[#0d3d45] border rounded-lg p-6 space-y-4 ${getProbabilityBg(signal.probability)}`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${getProbabilityBg(signal.probability)}`}>
            <TrendingUp className={`w-6 h-6 ${getProbabilityColor(signal.probability)}`} />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">{signal.prediction}</h3>
            <p className="text-xs text-gray-400">{signal.league}</p>
          </div>
        </div>
        <div className={`px-4 py-2 rounded-full ${getProbabilityBg(signal.probability)}`}>
          <span className={`text-lg font-bold ${getProbabilityColor(signal.probability)}`}>
            {signal.probability}%
          </span>
        </div>
      </div>

      {/* Match Info */}
      <div className="bg-[#0a2f35] rounded-lg p-4">
        <div className="flex items-center justify-center gap-4">
          <span className="text-white font-medium">{signal.homeTeam}</span>
          <span className="text-gray-500">vs</span>
          <span className="text-white font-medium">{signal.awayTeam}</span>
        </div>
      </div>

      {/* Reason */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span className="text-sm text-gray-400">Análise:</span>
        </div>
        <p className="text-sm text-white pl-6">{signal.reason}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button
          onClick={handleSendToTelegram}
          className="flex-1 bg-[#229ED9] hover:bg-[#1a7fb8] text-white"
        >
          <Send className="w-4 h-4 mr-2" />
          Enviar para Telegram
        </Button>
      </div>

      {/* Timestamp */}
      <div className="text-xs text-gray-500 text-center pt-2 border-t border-[#1a4f57]">
        Gerado em {new Date(signal.timestamp).toLocaleString('pt-BR')}
      </div>
    </div>
  );
};

export default SignalCard;