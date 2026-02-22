import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { 
  Target, TrendingUp, Calendar, Filter, Send, 
  RefreshCw, Zap, AlertTriangle, Loader2 
} from "lucide-react";
import { API } from "@/App";
import MatchCard from "@/components/MatchCard";
import StatsCard from "@/components/StatsCard";
import LeagueFilter from "@/components/LeagueFilter";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const Dashboard = () => {
  const [matches, setMatches] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [highProbOnly, setHighProbOnly] = useState(false);
  const [selectedMatches, setSelectedMatches] = useState([]);
  const [telegramConfigured, setTelegramConfigured] = useState(false);
  const [sending, setSending] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [matchesRes, leaguesRes, statsRes, telegramRes] = await Promise.all([
        axios.get(`${API}/matches`, {
          params: {
            league_id: selectedLeague,
            high_probability_only: highProbOnly
          }
        }),
        axios.get(`${API}/leagues`),
        axios.get(`${API}/stats/summary`),
        axios.get(`${API}/telegram/config`)
      ]);

      setMatches(matchesRes.data.matches);
      setLeagues(leaguesRes.data);
      setStats(statsRes.data);
      setTelegramConfigured(telegramRes.data.configured);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedLeague, highProbOnly]);

  const handleSelectMatch = (matchId) => {
    setSelectedMatches(prev => 
      prev.includes(matchId) 
        ? prev.filter(id => id !== matchId)
        : [...prev, matchId]
    );
  };

  const handleSendToTelegram = async () => {
    if (!telegramConfigured) {
      toast.error("Configure o Telegram primeiro!");
      return;
    }

    if (selectedMatches.length === 0) {
      toast.error("Selecione pelo menos um jogo");
      return;
    }

    setSending(true);
    try {
      await axios.post(`${API}/telegram/send`, {
        message: "🎯 *CORNERKICK PRO - SELECAO MANUAL*",
        game_ids: selectedMatches
      });
      toast.success("Mensagem enviada com sucesso!");
      setSelectedMatches([]);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erro ao enviar");
    } finally {
      setSending(false);
    }
  };

  const handleSendHighProbability = async () => {
    if (!telegramConfigured) {
      toast.error("Configure o Telegram primeiro!");
      return;
    }

    setSending(true);
    try {
      const res = await axios.post(`${API}/telegram/send-high-probability`);
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erro ao enviar");
    } finally {
      setSending(false);
    }
  };

  const highProbCount = matches.filter(m => m.is_high_probability).length;

  return (
    <div className="p-4 md:p-6 pt-16 md:pt-6" data-testid="dashboard">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white uppercase">
              Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Estatisticas de escanteios e prognosticos
            </p>
          </div>
          <Button
            onClick={fetchData}
            variant="outline"
            className="border-slate-700 text-slate-400 hover:text-white hover:border-slate-600"
            data-testid="refresh-btn"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid mb-6">
        <StatsCard 
          title="Total Jogos" 
          value={stats?.total_matches || 0}
          icon={Calendar}
        />
        <StatsCard 
          title="Alta Probabilidade" 
          value={stats?.high_probability_matches || 0}
          subtitle="+9 corners previstos"
          icon={Zap}
          highlight
        />
        <StatsCard 
          title="Media Corners" 
          value={stats?.average_predicted_corners?.toFixed(1) || "0.0"}
          subtitle="Todos os jogos"
          icon={Target}
        />
        <StatsCard 
          title="Ligas" 
          value={Object.keys(stats?.leagues || {}).length}
          icon={TrendingUp}
        />
      </div>

      {/* Filters */}
      <div className="bg-slate-900/30 border border-slate-800/50 rounded-sm p-4 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-sm text-slate-400 uppercase tracking-wider">Filtros</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="high-prob"
                checked={highProbOnly}
                onCheckedChange={setHighProbOnly}
                data-testid="high-prob-filter"
              />
              <Label htmlFor="high-prob" className="text-sm text-slate-400 cursor-pointer">
                Apenas Alta Prob. ({highProbCount})
              </Label>
            </div>
          </div>
        </div>
        
        <LeagueFilter 
          leagues={leagues}
          selectedLeague={selectedLeague}
          onSelectLeague={setSelectedLeague}
        />
      </div>

      {/* Telegram Actions */}
      {telegramConfigured && (
        <div className="bg-green-500/5 border border-green-500/20 rounded-sm p-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Send className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-white">Enviar para Telegram</p>
                <p className="text-xs text-slate-500">
                  {selectedMatches.length > 0 
                    ? `${selectedMatches.length} jogo(s) selecionado(s)`
                    : "Selecione jogos ou envie todos de alta probabilidade"
                  }
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleSendToTelegram}
                disabled={selectedMatches.length === 0 || sending}
                className="bg-green-600 hover:bg-green-500 text-white font-bold uppercase tracking-wider text-xs"
                data-testid="send-selected-btn"
              >
                {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                Enviar Selecionados
              </Button>
              
              <Button
                onClick={handleSendHighProbability}
                disabled={sending}
                variant="outline"
                className="border-green-500/30 text-green-500 hover:bg-green-500/10 font-bold uppercase tracking-wider text-xs"
                data-testid="send-high-prob-btn"
              >
                {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
                Enviar Alta Prob.
              </Button>
            </div>
          </div>
        </div>
      )}

      {!telegramConfigured && (
        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-sm p-4 mb-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <div>
              <p className="text-sm font-medium text-yellow-500">Telegram nao configurado</p>
              <p className="text-xs text-slate-500">
                Acesse a pagina Telegram para configurar o bot e grupo
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Matches Grid */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white uppercase tracking-wide">
            Jogos do Dia
          </h2>
          <span className="text-sm font-mono text-slate-500">
            {matches.length} jogos
          </span>
        </div>

        {loading ? (
          <div className="match-card-container">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-slate-900/50 border border-slate-700/50 rounded-sm h-64 skeleton" />
            ))}
          </div>
        ) : matches.length > 0 ? (
          <div className="match-card-container" data-testid="matches-container">
            {matches.map((match) => (
              <MatchCard 
                key={match.id}
                match={match}
                onSelect={handleSelectMatch}
                isSelected={selectedMatches.includes(match.id)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-slate-900/30 border border-slate-800/50 rounded-sm p-8 text-center">
            <Target className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500">Nenhum jogo encontrado com os filtros selecionados</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
