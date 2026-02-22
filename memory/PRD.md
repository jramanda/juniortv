# Corner Spotter - PRD (Product Requirements Document)

## Original Problem Statement
Criar uma extensão para o Chrome que identifique jogos com altas probabilidades de escanteios no site da Bet365. Critérios baseados em odds e estatísticas dos times. Integração com Telegram para enviar sinais. Analisar jogos ao vivo e pré-jogo.

## User Personas
1. **Apostador Profissional**: Busca identificar oportunidades de escanteios com alta probabilidade na Bet365
2. **Apostador Casual**: Quer receber sinais automatizados via Telegram
3. **Analista de Apostas**: Necessita de um dashboard para monitorar e gerenciar sinais

## Core Requirements (Static)
- Extensão Chrome para análise de página da Bet365
- Identificação automática de mercados de escanteios
- Cálculo de probabilidade implícita baseada em odds
- Integração com Telegram para envio de sinais
- Dashboard web para configuração e visualização
- Análise de jogos ao vivo e pré-jogo
- Critérios configuráveis (probabilidade mínima, range de odds)

## What's Been Implemented (2026-02-22)

### Backend (FastAPI + MongoDB)
- ✅ API RESTful completa com endpoints:
  - `/api/` - Healthcheck
  - `/api/stats` - Estatísticas gerais
  - `/api/settings` - Configurações de análise (GET/PUT)
  - `/api/telegram/config` - Configuração Telegram (GET/POST/PUT)
  - `/api/telegram/test` - Teste de conexão Telegram
  - `/api/signals` - CRUD de sinais
  - `/api/analyze` - Análise de jogos
- ✅ Integração com Telegram Bot API
- ✅ MongoDB para persistência

### Frontend (React + Tailwind + Shadcn)
- ✅ Dashboard com design "Tactical Terminal"
- ✅ Cards de estatísticas (Total Sinais, Enviados, Ao Vivo, Probabilidade Média)
- ✅ Lista de sinais com indicadores visuais
- ✅ Painel de configuração do Telegram
- ✅ Painel de configurações de análise
- ✅ Toasts para feedback de ações

### Extensão Chrome
- ✅ manifest.json (v3)
- ✅ popup.html/css/js - Interface do popup
- ✅ content.js - Script de análise da página Bet365
- ✅ background.js - Service worker
- ✅ Ícones da extensão

## P0 Features (MVP - DONE)
- [x] API de configuração do Telegram
- [x] API de configurações de análise
- [x] API de sinais (CRUD)
- [x] Dashboard web funcional
- [x] Extensão Chrome estruturada

## P1 Features (Next Priority)
- [ ] Histórico de performance dos sinais (win/loss rate)
- [ ] Gráficos de tendência com Recharts
- [ ] Notificações push no navegador
- [ ] Filtros avançados na lista de sinais

## P2 Features (Future)
- [ ] Machine Learning para predição de escanteios
- [ ] Integração com múltiplas casas de apostas
- [ ] Mobile app (React Native)
- [ ] Sistema de alertas customizados

## Next Tasks
1. Usuário deve criar Bot no Telegram (@BotFather)
2. Usuário deve configurar Bot Token e Chat ID no dashboard
3. Instalar extensão no Chrome (modo desenvolvedor)
4. Navegar até partida na Bet365 e usar "Analisar Página"
