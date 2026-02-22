import React, { useState } from 'react';
import { TrendingUp, Send, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '../hooks/use-toast';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SignalCard = ({ signal }) => {
  const { toast } = useToast();
  const [sending, setSending] = useState(false);

  const handleSendToTelegram = async () => {
    setSending(true);

    try {
      const response = await axios.post(`${API}/telegram/send-signal`, {
        signal_id: String(signal.id),
      });

      if (response.data.success) {
        toast({
          title: 'Sinal enviado!',
          description: 'Sinal enviado para o Telegram com sucesso',
        });
      }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Erro ao enviar sinal';
      toast({
        title: 'Erro',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
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
          disabled={sending}
          className="flex-1 bg-[#229ED9] hover:bg-[#1a7fb8] text-white"
        >
          {sending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Enviar para Telegram
            </>
          )}
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