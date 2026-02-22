// Corner Spotter - Extension Popup Script
// Tactical Terminal Theme

// Configuration defaults
const DEFAULT_CONFIG = {
  apiUrl: '',
  botToken: '',
  chatId: '',
  telegramEnabled: true,
  minProbability: 60,
  minOdds: 1.20,
  maxOdds: 2.50,
  autoTelegram: true,
  analyzeLive: true,
  analyzePrematch: true
};

// State
let config = { ...DEFAULT_CONFIG };
let signals = [];

// ============ UTILITIES ============

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icon = type === 'success' 
    ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>'
    : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
  
  toast.innerHTML = `${icon}<span>${message}</span>`;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function calculateProbability(odds) {
  if (odds <= 1) return 0;
  return ((1 / odds) * 100).toFixed(1);
}

function getProbabilityClass(prob) {
  if (prob >= 70) return 'high';
  if (prob >= 50) return 'medium';
  return 'low';
}

// ============ STORAGE ============

async function loadConfig() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['cornerSpotterConfig'], (result) => {
      if (result.cornerSpotterConfig) {
        config = { ...DEFAULT_CONFIG, ...result.cornerSpotterConfig };
      }
      resolve(config);
    });
  });
}

async function saveConfig() {
  return new Promise((resolve) => {
    chrome.storage.local.set({ cornerSpotterConfig: config }, resolve);
  });
}

async function loadSignals() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['cornerSpotterSignals'], (result) => {
      signals = result.cornerSpotterSignals || [];
      resolve(signals);
    });
  });
}

async function saveSignals() {
  return new Promise((resolve) => {
    chrome.storage.local.set({ cornerSpotterSignals: signals }, resolve);
  });
}

// ============ API CALLS ============

async function sendToAPI(endpoint, method = 'GET', data = null) {
  if (!config.apiUrl) {
    throw new Error('URL da API não configurada');
  }
  
  const url = `${config.apiUrl}/api${endpoint}`;
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  const response = await fetch(url, options);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Erro na API');
  }
  return response.json();
}

async function sendSignalToServer(signal) {
  try {
    await sendToAPI('/signals', 'POST', signal);
    return true;
  } catch (error) {
    console.error('Error sending to server:', error);
    return false;
  }
}

async function sendToTelegram(signal) {
  try {
    // Try to send via server first
    if (config.apiUrl) {
      const signalData = {
        home_team: signal.homeTeam,
        away_team: signal.awayTeam,
        league: signal.league,
        match_time: signal.matchTime,
        is_live: signal.isLive,
        corner_line: signal.cornerLine,
        odds: signal.odds,
        probability: signal.probability
      };
      
      const result = await sendToAPI('/signals', 'POST', signalData);
      if (result.success) {
        return true;
      }
    }
    
    // Direct Telegram API call if server fails or not configured
    if (config.botToken && config.chatId) {
      const message = formatTelegramMessage(signal);
      const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: config.chatId,
          text: message,
          parse_mode: 'HTML'
        })
      });
      
      return response.ok;
    }
    
    return false;
  } catch (error) {
    console.error('Error sending to Telegram:', error);
    return false;
  }
}

function formatTelegramMessage(signal) {
  const status = signal.isLive ? '🔴 AO VIVO' : '⏰ PRÉ-JOGO';
  const probEmoji = signal.probability >= 70 ? '🟢' : signal.probability >= 50 ? '🟡' : '🔴';
  
  return `
<b>⚽ SINAL DE ESCANTEIOS</b>

${status}
<b>🏆 ${signal.league}</b>

<b>${signal.homeTeam}</b> vs <b>${signal.awayTeam}</b>
⏱️ ${signal.matchTime}

📊 <b>${signal.cornerLine}</b>
💰 Odds: <b>${signal.odds.toFixed(2)}</b>
${probEmoji} Probabilidade: <b>${signal.probability}%</b>

#CornerSpotter #Escanteios
`.trim();
}

// ============ UI RENDERING ============

function renderSignals() {
  const container = document.getElementById('signals-list');
  const emptyState = document.getElementById('empty-state');
  
  if (signals.length === 0) {
    emptyState.style.display = 'flex';
    return;
  }
  
  emptyState.style.display = 'none';
  
  // Clear existing signal cards (but keep empty state)
  const existingCards = container.querySelectorAll('.signal-card');
  existingCards.forEach(card => card.remove());
  
  signals.forEach((signal, index) => {
    const card = document.createElement('div');
    card.className = 'signal-card';
    card.innerHTML = `
      <div class="signal-header">
        <span class="signal-league">${signal.league}</span>
        <div class="signal-badges">
          ${signal.isLive 
            ? '<span class="badge badge-live"><span class="dot"></span>AO VIVO</span>' 
            : '<span class="badge badge-prematch">PRÉ-JOGO</span>'}
          <span class="signal-time">${signal.matchTime}</span>
        </div>
      </div>
      <div class="signal-teams">
        <div class="team-name">${signal.homeTeam}</div>
        <div class="vs-divider">vs</div>
        <div class="team-name">${signal.awayTeam}</div>
      </div>
      <div class="signal-data">
        <div class="data-item">
          <span class="data-label">Linha</span>
          <span class="data-value line">${signal.cornerLine}</span>
        </div>
        <div class="data-item">
          <span class="data-label">Odds</span>
          <span class="data-value odds">${signal.odds.toFixed(2)}</span>
        </div>
        <div class="data-item">
          <span class="data-label">Prob.</span>
          <span class="data-value prob ${getProbabilityClass(signal.probability)}">${signal.probability}%</span>
        </div>
      </div>
      <div class="signal-actions">
        <button class="btn-send ${signal.sentToTelegram ? 'sent' : ''}" data-index="${index}" ${signal.sentToTelegram ? 'disabled' : ''}>
          ${signal.sentToTelegram 
            ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg><span>Enviado</span>'
            : '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg><span>Telegram</span>'}
        </button>
        <button class="btn-delete" data-index="${index}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    `;
    
    container.appendChild(card);
  });
  
  // Add event listeners
  document.querySelectorAll('.btn-send:not(.sent)').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const index = parseInt(e.currentTarget.dataset.index);
      const signal = signals[index];
      
      btn.disabled = true;
      btn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spinning"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg><span>Enviando...</span>';
      
      const success = await sendToTelegram(signal);
      
      if (success) {
        signals[index].sentToTelegram = true;
        await saveSignals();
        showToast('Sinal enviado para o Telegram!');
        renderSignals();
      } else {
        showToast('Erro ao enviar para o Telegram', 'error');
        btn.disabled = false;
        btn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg><span>Telegram</span>';
      }
    });
  });
  
  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const index = parseInt(e.currentTarget.dataset.index);
      signals.splice(index, 1);
      await saveSignals();
      renderSignals();
      showToast('Sinal removido');
    });
  });
}

function updateConfigUI() {
  // Telegram
  document.getElementById('bot-token').value = config.botToken || '';
  document.getElementById('chat-id').value = config.chatId || '';
  updateToggle('telegram-enabled', config.telegramEnabled);
  
  // Analysis
  document.getElementById('min-probability').value = config.minProbability;
  document.getElementById('min-odds').value = config.minOdds;
  document.getElementById('max-odds').value = config.maxOdds;
  updateToggle('auto-telegram', config.autoTelegram);
  updateToggle('analyze-live', config.analyzeLive);
  updateToggle('analyze-prematch', config.analyzePrematch);
  
  // API
  document.getElementById('api-url').value = config.apiUrl || '';
}

function updateToggle(id, value) {
  const toggle = document.getElementById(id);
  if (value) {
    toggle.classList.add('active');
  } else {
    toggle.classList.remove('active');
  }
}

// ============ EVENT HANDLERS ============

function setupTabs() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      // Update tabs
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Update content
      const tabName = tab.dataset.tab;
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });
      document.getElementById(`${tabName}-tab`).classList.add('active');
    });
  });
}

function setupToggles() {
  const toggles = ['telegram-enabled', 'auto-telegram', 'analyze-live', 'analyze-prematch'];
  
  toggles.forEach(id => {
    document.getElementById(id).addEventListener('click', function() {
      this.classList.toggle('active');
    });
  });
}

function setupButtons() {
  // Scan button
  document.getElementById('scan-btn').addEventListener('click', scanPage);
  
  // Save telegram
  document.getElementById('save-telegram').addEventListener('click', async () => {
    config.botToken = document.getElementById('bot-token').value;
    config.chatId = document.getElementById('chat-id').value;
    config.telegramEnabled = document.getElementById('telegram-enabled').classList.contains('active');
    await saveConfig();
    showToast('Configuração do Telegram salva!');
  });
  
  // Test telegram
  document.getElementById('test-telegram').addEventListener('click', async () => {
    if (!config.botToken || !config.chatId) {
      showToast('Configure o Bot Token e Chat ID primeiro', 'error');
      return;
    }
    
    try {
      const message = '🔔 Teste do Corner Spotter!\n\nSua integração com Telegram está funcionando! ✅';
      const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: config.chatId,
          text: message
        })
      });
      
      if (response.ok) {
        showToast('Mensagem de teste enviada!');
      } else {
        showToast('Erro ao enviar teste', 'error');
      }
    } catch (error) {
      showToast('Erro de conexão', 'error');
    }
  });
  
  // Save settings
  document.getElementById('save-settings').addEventListener('click', async () => {
    config.minProbability = parseFloat(document.getElementById('min-probability').value) || 60;
    config.minOdds = parseFloat(document.getElementById('min-odds').value) || 1.20;
    config.maxOdds = parseFloat(document.getElementById('max-odds').value) || 2.50;
    config.autoTelegram = document.getElementById('auto-telegram').classList.contains('active');
    config.analyzeLive = document.getElementById('analyze-live').classList.contains('active');
    config.analyzePrematch = document.getElementById('analyze-prematch').classList.contains('active');
    await saveConfig();
    showToast('Configurações salvas!');
  });
  
  // Test API
  document.getElementById('test-api').addEventListener('click', async () => {
    const apiUrl = document.getElementById('api-url').value;
    if (!apiUrl) {
      showToast('Informe a URL da API', 'error');
      return;
    }
    
    config.apiUrl = apiUrl;
    await saveConfig();
    
    try {
      const response = await fetch(`${apiUrl}/api/`);
      if (response.ok) {
        showToast('Conexão com API OK!');
      } else {
        showToast('Erro ao conectar na API', 'error');
      }
    } catch (error) {
      showToast('Erro de conexão', 'error');
    }
  });
}

async function scanPage() {
  const btn = document.getElementById('scan-btn');
  btn.disabled = true;
  btn.classList.add('scanning');
  btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg><span>Analisando...</span>';
  
  try {
    // Send message to content script
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url.includes('bet365.com')) {
      showToast('Navegue até uma página da Bet365', 'error');
      resetScanButton();
      return;
    }
    
    chrome.tabs.sendMessage(tab.id, { action: 'scan', config }, async (response) => {
      if (chrome.runtime.lastError) {
        showToast('Recarregue a página da Bet365', 'error');
        resetScanButton();
        return;
      }
      
      if (response && response.signals && response.signals.length > 0) {
        // Filter based on config
        const filteredSignals = response.signals.filter(s => {
          if (s.isLive && !config.analyzeLive) return false;
          if (!s.isLive && !config.analyzePrematch) return false;
          if (s.probability < config.minProbability) return false;
          if (s.odds < config.minOdds || s.odds > config.maxOdds) return false;
          return true;
        });
        
        // Add new signals
        for (const signal of filteredSignals) {
          const exists = signals.some(s => 
            s.homeTeam === signal.homeTeam && 
            s.awayTeam === signal.awayTeam && 
            s.cornerLine === signal.cornerLine
          );
          
          if (!exists) {
            signal.sentToTelegram = false;
            signals.unshift(signal);
            
            // Auto send to telegram
            if (config.autoTelegram && config.telegramEnabled) {
              const success = await sendToTelegram(signal);
              if (success) {
                signal.sentToTelegram = true;
              }
            }
          }
        }
        
        await saveSignals();
        renderSignals();
        
        document.getElementById('last-scan').textContent = `${filteredSignals.length} sinais encontrados`;
        showToast(`${filteredSignals.length} sinais encontrados!`);
      } else {
        document.getElementById('last-scan').textContent = 'Nenhum sinal';
        showToast('Nenhum sinal encontrado nesta página');
      }
      
      resetScanButton();
    });
  } catch (error) {
    console.error('Scan error:', error);
    showToast('Erro ao analisar página', 'error');
    resetScanButton();
  }
}

function resetScanButton() {
  const btn = document.getElementById('scan-btn');
  btn.disabled = false;
  btn.classList.remove('scanning');
  btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg><span>Analisar Página</span>';
}

// ============ INIT ============

document.addEventListener('DOMContentLoaded', async () => {
  await loadConfig();
  await loadSignals();
  
  updateConfigUI();
  renderSignals();
  
  setupTabs();
  setupToggles();
  setupButtons();
  
  // Update last scan time
  const now = new Date();
  document.getElementById('last-scan').textContent = `Último: ${now.toLocaleTimeString('pt-BR')}`;
});
