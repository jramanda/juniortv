import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { 
  Send, Save, CheckCircle, AlertCircle, 
  ExternalLink, Loader2, MessageSquare, Settings,
  Info
} from "lucide-react";
import { API } from "@/App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const TelegramConfig = () => {
  const [botToken, setBotToken] = useState("");
  const [groupId, setGroupId] = useState("");
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testMessage, setTestMessage] = useState("🎯 Teste do CornerKick Pro - Configuracao OK!");
  const [sendingTest, setSendingTest] = useState(false);
  const [logs, setLogs] = useState([]);

  const fetchConfig = async () => {
    try {
      const [configRes, logsRes] = await Promise.all([
        axios.get(`${API}/telegram/config`),
        axios.get(`${API}/telegram/logs`)
      ]);
      setConfig(configRes.data);
      setLogs(logsRes.data.logs || []);
      if (configRes.data.configured) {
        setGroupId(configRes.data.group_id);
      }
    } catch (error) {
      console.error("Error fetching config:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async () => {
    if (!botToken || !groupId) {
      toast.error("Preencha todos os campos");
      return;
    }

    setSaving(true);
    try {
      await axios.post(`${API}/telegram/config`, {
        bot_token: botToken,
        group_id: groupId
      });
      toast.success("Configuracao salva com sucesso!");
      setBotToken("");
      fetchConfig();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async () => {
    if (!config?.configured) {
      toast.error("Configure o Telegram primeiro");
      return;
    }

    setSendingTest(true);
    try {
      await axios.post(`${API}/telegram/send`, {
        message: testMessage
      });
      toast.success("Mensagem de teste enviada!");
      fetchConfig();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erro ao enviar teste");
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <div className="p-4 md:p-6 pt-16 md:pt-6 max-w-4xl" data-testid="telegram-config">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white uppercase">
          Configuracao Telegram
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure o bot para enviar alertas de jogos
        </p>
      </div>

      {/* Status Card */}
      <div className={`rounded-sm p-4 mb-6 border ${
        config?.configured 
          ? 'bg-green-500/5 border-green-500/20' 
          : 'bg-slate-900/50 border-slate-700/50'
      }`}>
        <div className="flex items-center gap-3">
          {config?.configured ? (
            <>
              <CheckCircle className="w-6 h-6 text-green-500" />
              <div>
                <p className="font-medium text-green-500">Telegram Configurado</p>
                <p className="text-xs text-slate-500 font-mono">
                  Grupo ID: {config.group_id} | Token: {config.masked_token}
                </p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="w-6 h-6 text-yellow-500" />
              <div>
                <p className="font-medium text-yellow-500">Telegram Nao Configurado</p>
                <p className="text-xs text-slate-500">
                  Preencha os campos abaixo para configurar
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Configuration Form */}
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-sm p-6 mb-6">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="w-5 h-5 text-slate-500" />
          <h2 className="text-lg font-bold text-white uppercase tracking-wide">
            Credenciais do Bot
          </h2>
        </div>

        <div className="space-y-6">
          {/* Bot Token */}
          <div>
            <Label htmlFor="bot-token" className="text-sm text-slate-400 uppercase tracking-wider mb-2 block">
              Bot Token
            </Label>
            <Input
              id="bot-token"
              type="password"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz..."
              className="input-code w-full"
              data-testid="bot-token-input"
            />
            <p className="text-xs text-slate-600 mt-2 flex items-center gap-1">
              <Info className="w-3 h-3" />
              Obtenha o token criando um bot com @BotFather no Telegram
            </p>
          </div>

          {/* Group ID */}
          <div>
            <Label htmlFor="group-id" className="text-sm text-slate-400 uppercase tracking-wider mb-2 block">
              ID do Grupo
            </Label>
            <Input
              id="group-id"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              placeholder="-1001234567890"
              className="input-code w-full"
              data-testid="group-id-input"
            />
            <p className="text-xs text-slate-600 mt-2 flex items-center gap-1">
              <Info className="w-3 h-3" />
              Use @userinfobot ou @RawDataBot para obter o ID do grupo
            </p>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving || !botToken || !groupId}
            className="bg-green-600 hover:bg-green-500 text-white font-bold uppercase tracking-wider w-full"
            data-testid="save-config-btn"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Salvar Configuracao
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-slate-900/30 border border-slate-800/50 rounded-sm p-6 mb-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-4 flex items-center gap-2">
          <ExternalLink className="w-4 h-4" />
          Como Configurar
        </h3>
        <ol className="space-y-3 text-sm text-slate-400">
          <li className="flex gap-2">
            <span className="font-mono text-green-500">1.</span>
            Abra o Telegram e busque por @BotFather
          </li>
          <li className="flex gap-2">
            <span className="font-mono text-green-500">2.</span>
            Envie /newbot e siga as instrucoes para criar um novo bot
          </li>
          <li className="flex gap-2">
            <span className="font-mono text-green-500">3.</span>
            Copie o token fornecido pelo BotFather
          </li>
          <li className="flex gap-2">
            <span className="font-mono text-green-500">4.</span>
            Adicione o bot ao seu grupo do Telegram
          </li>
          <li className="flex gap-2">
            <span className="font-mono text-green-500">5.</span>
            Use @userinfobot no grupo para obter o ID (comeca com -)
          </li>
          <li className="flex gap-2">
            <span className="font-mono text-green-500">6.</span>
            Cole as credenciais acima e salve
          </li>
        </ol>
      </div>

      {/* Test Message */}
      {config?.configured && (
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-slate-500" />
            <h2 className="text-lg font-bold text-white uppercase tracking-wide">
              Testar Envio
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="test-message" className="text-sm text-slate-400 uppercase tracking-wider mb-2 block">
                Mensagem de Teste
              </Label>
              <Textarea
                id="test-message"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Digite sua mensagem de teste..."
                className="input-code w-full min-h-[100px]"
                data-testid="test-message-input"
              />
            </div>

            <Button
              onClick={handleSendTest}
              disabled={sendingTest || !testMessage}
              variant="outline"
              className="border-green-500/30 text-green-500 hover:bg-green-500/10 font-bold uppercase tracking-wider"
              data-testid="send-test-btn"
            >
              {sendingTest ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Enviar Teste
            </Button>
          </div>
        </div>
      )}

      {/* Message Logs */}
      {logs.length > 0 && (
        <div className="bg-slate-900/30 border border-slate-800/50 rounded-sm p-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-4">
            Ultimas Mensagens Enviadas
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {logs.slice(0, 10).map((log, index) => (
              <div 
                key={index}
                className="bg-slate-950/50 border border-slate-800/50 rounded-sm p-3"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono text-green-500">
                    {new Date(log.sent_at).toLocaleString('pt-BR')}
                  </span>
                  <span className={`text-xs font-mono ${
                    log.status === 'success' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {log.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate">
                  {log.message?.substring(0, 100)}...
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TelegramConfig;
