import { useState, useEffect, useCallback } from "react";
import "@/App.css";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { 
  Activity, 
  Settings, 
  Send, 
  Trash2, 
  RefreshCw,
  Zap,
  TrendingUp,
  Clock,
  Target,
  MessageCircle,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Download
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// ============ COMPONENTS ============

export const Header = () => (
  <header className="glass-panel sticky top-0 z-50 px-6 py-4" data-testid="header">
    <div className="max-w-7xl mx-auto flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-md bg-emerald-500/20 flex items-center justify-center">
          <Target className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight uppercase text-slate-50">
            Corner Spotter
          </h1>
          <p className="text-xs text-slate-500 tracking-wider uppercase">Bet365 Corner Analysis</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 live-pulse"></span>
          Online
        </span>
      </div>
    </div>
  </header>
);

export const StatsCard = ({ icon: Icon, label, value, color = "emerald" }) => {
  const colorClasses = {
    emerald: "text-emerald-400 bg-emerald-500/20",
    amber: "text-amber-400 bg-amber-500/20",
    red: "text-red-400 bg-red-500/20",
    blue: "text-blue-400 bg-blue-500/20"
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-md p-4 card-hover" data-testid={`stats-${label.toLowerCase().replace(/\s/g, '-')}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold tracking-[0.15em] uppercase text-slate-500">{label}</span>
        <div className={`w-8 h-8 rounded-md ${colorClasses[color]} flex items-center justify-center`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="font-data text-3xl font-bold text-slate-50 stat-number">{value}</p>
    </div>
  );
};

export const SignalCard = ({ signal, onSendTelegram, onDelete }) => {
  const getProbabilityClass = (prob) => {
    if (prob >= 70) return "prob-high";
    if (prob >= 50) return "prob-medium";
    return "prob-low";
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-md p-4 card-hover" data-testid={`signal-${signal.id}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold tracking-wider uppercase text-slate-500">{signal.league}</span>
        <div className="flex items-center gap-2">
          {signal.is_live ? (
            <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-xs font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 live-pulse"></span>
              AO VIVO
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-xs font-bold">
              PRÉ-JOGO
            </span>
          )}
          <span className="font-data text-xs text-slate-400">{signal.match_time}</span>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="font-heading text-lg font-semibold text-slate-100 tracking-wide">
          {signal.home_team}
        </div>
        <div className="text-xs text-slate-500 my-1">vs</div>
        <div className="font-heading text-lg font-semibold text-slate-100 tracking-wide">
          {signal.away_team}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs text-slate-500 block mb-1">Linha</span>
          <span className="font-data text-sm font-medium text-slate-200">{signal.corner_line}</span>
        </div>
        <div>
          <span className="text-xs text-slate-500 block mb-1">Odds</span>
          <span className="font-data text-xl font-bold text-amber-400">{signal.odds.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-xs text-slate-500 block mb-1">Prob.</span>
          <span className={`font-data text-sm font-bold px-2 py-1 rounded ${getProbabilityClass(signal.probability)}`}>
            {signal.probability.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
        {signal.sent_to_telegram ? (
          <span className="flex items-center gap-1 text-xs text-emerald-400">
            <CheckCircle className="w-3.5 h-3.5" />
            Enviado
          </span>
        ) : (
          <button
            onClick={() => onSendTelegram(signal.id)}
            className="flex items-center gap-1 px-3 py-1.5 rounded bg-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-emerald-500/30 transition-colors"
            data-testid={`send-telegram-${signal.id}`}
          >
            <Send className="w-3.5 h-3.5" />
            Enviar Telegram
          </button>
        )}
        <button
          onClick={() => onDelete(signal.id)}
          className="ml-auto p-1.5 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          data-testid={`delete-signal-${signal.id}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export const TelegramConfigPanel = ({ config, onSave, onTest }) => {
  const [botToken, setBotToken] = useState("");
  const [chatId, setChatId] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (config) {
      setBotToken(config.bot_token || "");
      setChatId(config.chat_id || "");
      setEnabled(config.enabled ?? true);
    }
  }, [config]);

  const handleSave = async () => {
    setSaving(true);
    await onSave({ bot_token: botToken, chat_id: chatId, enabled });
    setSaving(false);
  };

  const handleTest = async () => {
    setTesting(true);
    await onTest();
    setTesting(false);
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-md p-5" data-testid="telegram-config-panel">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="w-5 h-5 text-blue-400" />
        <h3 className="font-heading text-lg font-semibold uppercase tracking-wide">Telegram</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold tracking-wider uppercase text-slate-500 block mb-2">
            Bot Token
          </label>
          <input
            type="password"
            value={botToken}
            onChange={(e) => setBotToken(e.target.value)}
            placeholder="123456789:ABC..."
            className="w-full input-field font-data text-sm"
            data-testid="telegram-bot-token-input"
          />
        </div>
        
        <div>
          <label className="text-xs font-bold tracking-wider uppercase text-slate-500 block mb-2">
            Chat ID
          </label>
          <input
            type="text"
            value={chatId}
            onChange={(e) => setChatId(e.target.value)}
            placeholder="-1001234567890"
            className="w-full input-field font-data text-sm"
            data-testid="telegram-chat-id-input"
          />
        </div>

        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-slate-300">Ativo</span>
          <button
            onClick={() => setEnabled(!enabled)}
            className={`w-12 h-6 rounded-full transition-colors ${enabled ? 'bg-emerald-500' : 'bg-slate-700'}`}
            data-testid="telegram-enabled-toggle"
          >
            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 btn-primary flex items-center justify-center gap-2"
            data-testid="save-telegram-config"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            Salvar
          </button>
          <button
            onClick={handleTest}
            disabled={testing || !botToken || !chatId}
            className="btn-secondary flex items-center gap-2"
            data-testid="test-telegram"
          >
            {testing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Testar
          </button>
        </div>
      </div>
    </div>
  );
};

export const SettingsPanel = ({ settings, onSave }) => {
  const [formData, setFormData] = useState({
    min_probability: 60,
    min_odds: 1.20,
    max_odds: 2.50,
    auto_send_telegram: true,
    analyze_live: true,
    analyze_prematch: true
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        min_probability: settings.min_probability ?? 60,
        min_odds: settings.min_odds ?? 1.20,
        max_odds: settings.max_odds ?? 2.50,
        auto_send_telegram: settings.auto_send_telegram ?? true,
        analyze_live: settings.analyze_live ?? true,
        analyze_prematch: settings.analyze_prematch ?? true
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    await onSave(formData);
    setSaving(false);
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-md p-5" data-testid="settings-panel">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-5 h-5 text-amber-400" />
        <h3 className="font-heading text-lg font-semibold uppercase tracking-wide">Configurações</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold tracking-wider uppercase text-slate-500 block mb-2">
            Probabilidade Mínima (%)
          </label>
          <input
            type="number"
            value={formData.min_probability}
            onChange={(e) => setFormData({...formData, min_probability: parseFloat(e.target.value)})}
            className="w-full input-field font-data text-sm"
            min="0"
            max="100"
            step="5"
            data-testid="min-probability-input"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold tracking-wider uppercase text-slate-500 block mb-2">
              Odds Mín
            </label>
            <input
              type="number"
              value={formData.min_odds}
              onChange={(e) => setFormData({...formData, min_odds: parseFloat(e.target.value)})}
              className="w-full input-field font-data text-sm"
              min="1"
              step="0.05"
              data-testid="min-odds-input"
            />
          </div>
          <div>
            <label className="text-xs font-bold tracking-wider uppercase text-slate-500 block mb-2">
              Odds Máx
            </label>
            <input
              type="number"
              value={formData.max_odds}
              onChange={(e) => setFormData({...formData, max_odds: parseFloat(e.target.value)})}
              className="w-full input-field font-data text-sm"
              min="1"
              step="0.05"
              data-testid="max-odds-input"
            />
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {[
            { key: 'auto_send_telegram', label: 'Envio automático Telegram' },
            { key: 'analyze_live', label: 'Analisar jogos ao vivo' },
            { key: 'analyze_prematch', label: 'Analisar pré-jogo' }
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-slate-300">{label}</span>
              <button
                onClick={() => setFormData({...formData, [key]: !formData[key]})}
                className={`w-12 h-6 rounded-full transition-colors ${formData[key] ? 'bg-emerald-500' : 'bg-slate-700'}`}
                data-testid={`toggle-${key}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${formData[key] ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full btn-primary flex items-center justify-center gap-2 mt-4"
          data-testid="save-settings"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          Salvar Configurações
        </button>
      </div>
    </div>
  );
};

export const ExtensionDownload = () => (
  <div className="bg-slate-900/50 border border-slate-800 rounded-md p-5" data-testid="extension-download">
    <div className="flex items-center gap-2 mb-4">
      <Zap className="w-5 h-5 text-emerald-400" />
      <h3 className="font-heading text-lg font-semibold uppercase tracking-wide">Extensão Chrome</h3>
    </div>
    
    <p className="text-sm text-slate-400 mb-4">
      Baixe a extensão para Chrome e instale manualmente para analisar jogos na Bet365.
    </p>
    
    <div className="bg-slate-800/50 rounded-md p-4 mb-4">
      <h4 className="text-xs font-bold tracking-wider uppercase text-slate-500 mb-2">Como instalar:</h4>
      <ol className="text-sm text-slate-300 space-y-1">
        <li>1. Baixe a pasta da extensão</li>
        <li>2. Acesse chrome://extensions</li>
        <li>3. Ative "Modo desenvolvedor"</li>
        <li>4. Clique em "Carregar sem compactação"</li>
        <li>5. Selecione a pasta baixada</li>
      </ol>
    </div>
    
    <a
      href="/extension"
      target="_blank"
      className="w-full btn-primary flex items-center justify-center gap-2"
      data-testid="download-extension"
    >
      <Download className="w-4 h-4" />
      Ver Extensão
    </a>
  </div>
);

// ============ MAIN APP ============

function App() {
  const [stats, setStats] = useState(null);
  const [signals, setSignals] = useState([]);
  const [telegramConfig, setTelegramConfig] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, signalsRes, telegramRes, settingsRes] = await Promise.all([
        axios.get(`${API}/stats`),
        axios.get(`${API}/signals`),
        axios.get(`${API}/telegram/config`),
        axios.get(`${API}/settings`)
      ]);
      
      setStats(statsRes.data);
      setSignals(signalsRes.data);
      setTelegramConfig(telegramRes.data);
      setSettings(settingsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const saveTelegramConfig = async (config) => {
    try {
      await axios.post(`${API}/telegram/config`, config);
      toast.success("Configuração do Telegram salva!");
      fetchData();
    } catch (error) {
      toast.error("Erro ao salvar configuração");
    }
  };

  const testTelegram = async () => {
    try {
      await axios.post(`${API}/telegram/test`);
      toast.success("Mensagem de teste enviada!");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erro ao enviar teste");
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      await axios.put(`${API}/settings`, newSettings);
      toast.success("Configurações salvas!");
      fetchData();
    } catch (error) {
      toast.error("Erro ao salvar configurações");
    }
  };

  const sendSignalToTelegram = async (signalId) => {
    try {
      await axios.post(`${API}/signals/${signalId}/send-telegram`);
      toast.success("Sinal enviado para o Telegram!");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erro ao enviar sinal");
    }
  };

  const deleteSignal = async (signalId) => {
    try {
      await axios.delete(`${API}/signals/${signalId}`);
      toast.success("Sinal removido");
      fetchData();
    } catch (error) {
      toast.error("Erro ao remover sinal");
    }
  };

  const clearAllSignals = async () => {
    if (!window.confirm("Tem certeza que deseja limpar todos os sinais?")) return;
    try {
      await axios.delete(`${API}/signals`);
      toast.success("Todos os sinais foram removidos");
      fetchData();
    } catch (error) {
      toast.error("Erro ao limpar sinais");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 grid-bg">
      <Toaster position="top-right" theme="dark" richColors />
      <Header />
      
      <main className="max-w-7xl mx-auto p-4 md:p-8" data-testid="main-content">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8" data-testid="stats-grid">
          <StatsCard 
            icon={BarChart3} 
            label="Total Sinais" 
            value={stats?.total_signals || 0} 
            color="emerald"
          />
          <StatsCard 
            icon={Send} 
            label="Enviados" 
            value={stats?.sent_to_telegram || 0} 
            color="blue"
          />
          <StatsCard 
            icon={Activity} 
            label="Ao Vivo" 
            value={stats?.live_signals || 0} 
            color="red"
          />
          <StatsCard 
            icon={TrendingUp} 
            label="Prob. Média" 
            value={`${stats?.avg_probability || 0}%`} 
            color="amber"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Signals List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-400" />
                <h2 className="font-heading text-xl font-semibold uppercase tracking-wide">Sinais</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchData}
                  className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                  data-testid="refresh-signals"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                {signals.length > 0 && (
                  <button
                    onClick={clearAllSignals}
                    className="p-2 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                    data-testid="clear-signals"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {signals.length === 0 ? (
              <div className="bg-slate-900/50 border border-slate-800 rounded-md p-8 text-center" data-testid="no-signals">
                <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="font-heading text-lg text-slate-400 mb-2">Nenhum sinal ainda</h3>
                <p className="text-sm text-slate-500">
                  Use a extensão do Chrome na Bet365 para identificar oportunidades de escanteios.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="signals-list">
                {signals.map((signal) => (
                  <SignalCard
                    key={signal.id}
                    signal={signal}
                    onSendTelegram={sendSignalToTelegram}
                    onDelete={deleteSignal}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Config Sidebar */}
          <div className="space-y-6">
            <TelegramConfigPanel
              config={telegramConfig}
              onSave={saveTelegramConfig}
              onTest={testTelegram}
            />
            <SettingsPanel
              settings={settings}
              onSave={saveSettings}
            />
            <ExtensionDownload />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
