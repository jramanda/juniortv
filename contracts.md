# Contratos de API - SokkerPRO Clone

## 1. Endpoints de API

### Telegram Configuration
- **POST /api/telegram/config**
  - Body: `{ telegram_token: string, chat_id: string }`
  - Response: `{ success: boolean, message: string }`
  - Salva configurações do Telegram no MongoDB

- **GET /api/telegram/config**
  - Response: `{ telegram_token: string (masked), chat_id: string, configured: boolean }`
  - Retorna configurações do Telegram

- **POST /api/telegram/send-signal**
  - Body: `{ signal_id: string, telegram_token: string, chat_id: string }`
  - Response: `{ success: boolean, message: string }`
  - Envia sinal para o Telegram usando Bot API

### Favorites
- **POST /api/favorites/toggle**
  - Body: `{ match_id: string, type: 'match' | 'league' }`
  - Response: `{ success: boolean, favorites: object }`
  - Adiciona/remove favorito

- **GET /api/favorites**
  - Response: `{ matches: string[], leagues: string[] }`
  - Retorna favoritos do usuário

### Matches & Signals
- **GET /api/matches**
  - Query: `?status=all|live|scheduled`
  - Response: `{ matches: Match[], leagues: League[] }`
  - Retorna partidas (por enquanto mock, depois será scraping)

- **GET /api/signals**
  - Response: `{ signals: Signal[] }`
  - Retorna sinais de alta probabilidade

## 2. Dados Mockados no Frontend

Arquivos com dados mock que serão substituídos:
- `/app/frontend/src/mocks/mockData.js`
  - `mockLeagues`: dados de ligas
  - `mockMatches`: dados de partidas
  - `mockSignals`: dados de sinais
  - `mockFavorites`: favoritos (será movido para backend)

## 3. Integração Frontend-Backend

### Mudanças necessárias no Frontend:
1. **Header.jsx**: Substituir localStorage por chamadas à API
   - `handleSaveConfig` → POST /api/telegram/config
   
2. **SignalCard.jsx**: Enviar sinal real para Telegram
   - `handleSendToTelegram` → POST /api/telegram/send-signal
   
3. **Dashboard.jsx / Favorites.jsx**: Buscar dados da API
   - `mockMatches` → GET /api/matches
   - `favorites` → GET /api/favorites
   - `onToggleFavorite` → POST /api/favorites/toggle

4. **Signals.jsx**: Buscar sinais da API
   - `mockSignals` → GET /api/signals

## 4. Implementação Backend

### Dependências necessárias:
- `requests` (já instalada) - para Telegram Bot API

### Modelos MongoDB:
1. **TelegramConfig**
   - telegram_token: string (encrypted)
   - chat_id: string
   - user_id: string (futuramente para multi-usuário)
   - created_at: datetime

2. **Favorites**
   - user_id: string (futuramente)
   - matches: list[string]
   - leagues: list[string]
   - updated_at: datetime

3. **Match** (futuramente com scraping)
   - match_id: string
   - league_id: string
   - home_team: object
   - away_team: object
   - status: string
   - probability: int
   - stats: object

4. **Signal**
   - signal_id: string
   - match_id: string
   - probability: int
   - prediction: string
   - reason: string
   - timestamp: datetime
   - status: string

## 5. Telegram Bot Integration

### API Telegram:
- Base URL: `https://api.telegram.org/bot{token}/sendMessage`
- Método: POST
- Body: `{ chat_id: string, text: string, parse_mode: 'HTML' }`

### Formato da mensagem de sinal:
```
🎯 <b>SINAL DE ALTA PROBABILIDADE</b>

⚽ <b>Jogo:</b> {homeTeam} vs {awayTeam}
🏆 <b>Liga:</b> {league}
📊 <b>Probabilidade:</b> {probability}%
🎲 <b>Previsão:</b> {prediction}

✅ <b>Análise:</b>
{reason}

⏰ Gerado em {timestamp}
```

## 6. Próximos Passos (após backend básico):

1. Implementar web scraping do SokkerPRO
2. Algoritmo de análise de probabilidade de gols
3. Atualização automática de partidas (polling/websocket)
4. Sistema de autenticação para multi-usuário
5. Notificações automáticas de sinais
