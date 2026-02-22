# CornerKick Pro - PRD (Product Requirements Document)

## Original Problem Statement
Site de estatísticas de futebol que mostre jogos e liste jogos com maior probabilidade de sair muitos escanteios (corners), seguindo médias e prognósticos. Também deve ter opção para enviar alertas para um grupo do Telegram.

### User Requirements
- API gratuita de futebol
- Todas as ligas disponíveis
- Opção no site para configurar ID do grupo Telegram
- Filtro para jogos com média acima de 9 escanteios

## User Personas
1. **Apostador Casual**: Busca dicas rápidas de jogos com alta probabilidade de corners
2. **Apostador Profissional**: Analisa estatísticas detalhadas e envia alertas para grupos

## Core Requirements (Static)
- Dashboard com jogos do dia e estatísticas de escanteios
- Filtro por liga e alta probabilidade (+9 corners)
- Cards de jogos com médias de corners por time
- Configuração do Telegram (bot token + group ID) dentro do site
- Envio de alertas para grupo do Telegram

## What's Been Implemented (Jan 2026)
- ✅ Backend FastAPI com dados mock de 8 ligas (Premier League, La Liga, Serie A, Bundesliga, Ligue 1, Brasileirao, Primeira Liga, Eredivisie)
- ✅ Dashboard com cards de jogos mostrando:
  - Times e médias de corners
  - Previsão total de corners
  - Probabilidade de Over 9 corners
  - Badge "HIGH PROB" para jogos de alta probabilidade
- ✅ Filtros por liga e toggle de alta probabilidade
- ✅ Página de configuração do Telegram com:
  - Input para Bot Token e Group ID
  - Instruções de como configurar
  - Teste de envio de mensagem
  - Log de mensagens enviadas
- ✅ Seleção de jogos para enviar ao Telegram
- ✅ Botão para enviar todos jogos de alta probabilidade

## Architecture
- **Frontend**: React + Tailwind CSS + Shadcn/UI
- **Backend**: FastAPI + MongoDB
- **Integrations**: Telegram Bot API
- **Data**: Mock data (dados simulados baseados em estatísticas reais)

## Prioritized Backlog

### P0 (Critical) - DONE
- [x] Dashboard com jogos e estatísticas
- [x] Filtros por liga
- [x] Filtro de alta probabilidade
- [x] Configuração do Telegram
- [x] Envio para Telegram

### P1 (Important) - Future
- [ ] Integrar API real de futebol (API-Football ou FootyStats)
- [ ] Histórico de resultados e taxa de acerto
- [ ] Agendamento automático de envio de alertas
- [ ] Notificações de jogos ao vivo

### P2 (Nice to Have) - Future
- [ ] Análise detalhada por time
- [ ] Gráficos de tendências
- [ ] Multi-idioma
- [ ] PWA para mobile

## Next Tasks
1. Integrar com API real de futebol para dados ao vivo
2. Adicionar histórico de previsões vs resultados
3. Implementar agendamento de alertas automáticos
