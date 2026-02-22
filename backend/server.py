from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import List, Optional
from datetime import datetime

from models import (
    TelegramConfig, TelegramConfigCreate, TelegramConfigResponse,
    SendSignalRequest, Favorites, ToggleFavoriteRequest,
    Match, League, Signal
)
from telegram_service import TelegramService


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Mock data (temporário - será substituído por scraping)
MOCK_LEAGUES = [
    {"id": 1, "name": "BRAZIL Série A", "country": "Brazil", "flag": "🇧🇷", "matches": 3},
    {"id": 2, "name": "ENGLAND Premier League", "country": "England", "flag": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "matches": 5},
    {"id": 3, "name": "SPAIN La Liga", "country": "Spain", "flag": "🇪🇸", "matches": 4},
    {"id": 4, "name": "UEFA Champions League", "country": "Europe", "flag": "🇪🇺", "matches": 6}
]

MOCK_MATCHES = [
    {
        "id": 1, "leagueId": 1, "leagueName": "BRAZIL Série A",
        "homeTeam": {"name": "Flamengo", "logo": "⚽", "score": 2},
        "awayTeam": {"name": "Palmeiras", "logo": "⚽", "score": 1},
        "status": "LIVE", "minute": "67'", "time": "20:30", "probability": 78,
        "stats": {
            "possession": {"home": 58, "away": 42}, "shots": {"home": 14, "away": 8},
            "shotsOnTarget": {"home": 7, "away": 3}, "corners": {"home": 6, "away": 2},
            "fouls": {"home": 8, "away": 12}
        }
    },
    {
        "id": 2, "leagueId": 1, "leagueName": "BRAZIL Série A",
        "homeTeam": {"name": "Corinthians", "logo": "⚽", "score": 1},
        "awayTeam": {"name": "São Paulo", "logo": "⚽", "score": 1},
        "status": "LIVE", "minute": "45'+2", "time": "18:00", "probability": 65,
        "stats": {
            "possession": {"home": 52, "away": 48}, "shots": {"home": 9, "away": 11},
            "shotsOnTarget": {"home": 4, "away": 5}, "corners": {"home": 3, "away": 4},
            "fouls": {"home": 7, "away": 6}
        }
    },
    {
        "id": 3, "leagueId": 2, "leagueName": "ENGLAND Premier League",
        "homeTeam": {"name": "Manchester United", "logo": "⚽", "score": 0},
        "awayTeam": {"name": "Liverpool", "logo": "⚽", "score": 2},
        "status": "LIVE", "minute": "82'", "time": "16:30", "probability": 85,
        "stats": {
            "possession": {"home": 45, "away": 55}, "shots": {"home": 8, "away": 16},
            "shotsOnTarget": {"home": 2, "away": 9}, "corners": {"home": 3, "away": 8},
            "fouls": {"home": 11, "away": 7}
        }
    },
    {
        "id": 4, "leagueId": 2, "leagueName": "ENGLAND Premier League",
        "homeTeam": {"name": "Arsenal", "logo": "⚽", "score": 3},
        "awayTeam": {"name": "Chelsea", "logo": "⚽", "score": 1},
        "status": "LIVE", "minute": "71'", "time": "14:00", "probability": 72,
        "stats": {
            "possession": {"home": 61, "away": 39}, "shots": {"home": 18, "away": 7},
            "shotsOnTarget": {"home": 10, "away": 4}, "corners": {"home": 9, "away": 2},
            "fouls": {"home": 5, "away": 13}
        }
    },
    {
        "id": 5, "leagueId": 3, "leagueName": "SPAIN La Liga",
        "homeTeam": {"name": "Real Madrid", "logo": "⚽", "score": None},
        "awayTeam": {"name": "Barcelona", "logo": "⚽", "score": None},
        "status": "SCHEDULED", "minute": None, "time": "21:00", "probability": 88,
        "stats": None
    },
    {
        "id": 6, "leagueId": 4, "leagueName": "UEFA Champions League",
        "homeTeam": {"name": "Bayern Munich", "logo": "⚽", "score": 1},
        "awayTeam": {"name": "PSG", "logo": "⚽", "score": 0},
        "status": "LIVE", "minute": "38'", "time": "17:00", "probability": 91,
        "stats": {
            "possession": {"home": 68, "away": 32}, "shots": {"home": 12, "away": 3},
            "shotsOnTarget": {"home": 6, "away": 1}, "corners": {"home": 7, "away": 1},
            "fouls": {"home": 4, "away": 9}
        }
    }
]

MOCK_SIGNALS = [
    {
        "id": 1, "matchId": 1, "homeTeam": "Flamengo", "awayTeam": "Palmeiras",
        "probability": 78, "prediction": "Mais de 2.5 gols",
        "reason": "Alta média de gols nos últimos jogos (3.2 gols/jogo)",
        "timestamp": datetime.utcnow().isoformat(), "status": "ACTIVE",
        "league": "BRAZIL Série A"
    },
    {
        "id": 2, "matchId": 3, "homeTeam": "Manchester United", "awayTeam": "Liverpool",
        "probability": 85, "prediction": "Ambas equipes marcam",
        "reason": "Últimos 5 confrontos tiveram gols dos dois times",
        "timestamp": datetime.utcnow().isoformat(), "status": "ACTIVE",
        "league": "ENGLAND Premier League"
    },
    {
        "id": 3, "matchId": 6, "homeTeam": "Bayern Munich", "awayTeam": "PSG",
        "probability": 91, "prediction": "Mais de 3.5 gols",
        "reason": "Média combinada de 4.1 gols nos últimos 10 jogos",
        "timestamp": datetime.utcnow().isoformat(), "status": "ACTIVE",
        "league": "UEFA Champions League"
    }
]


# ============ TELEGRAM ROUTES ============

@api_router.post("/telegram/config")
async def save_telegram_config(config: TelegramConfigCreate):
    """Salva configuração do Telegram Bot"""
    try:
        # Testa a conexão antes de salvar
        test_result = TelegramService.test_connection(config.telegram_token, config.chat_id)
        
        if not test_result["success"]:
            raise HTTPException(status_code=400, detail=test_result["message"])
        
        # Remove configuração antiga
        await db.telegram_configs.delete_many({"user_id": "default_user"})
        
        # Salva nova configuração
        telegram_config = TelegramConfig(**config.dict())
        await db.telegram_configs.insert_one(telegram_config.dict())
        
        return {
            "success": True,
            "message": "Configuração salva com sucesso! Mensagem de teste enviada."
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Erro ao salvar configuração: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao salvar configuração: {str(e)}")


@api_router.get("/telegram/config")
async def get_telegram_config():
    """Retorna configuração do Telegram Bot (token mascarado)"""
    config = await db.telegram_configs.find_one({"user_id": "default_user"})
    
    if not config:
        return {"configured": False, "telegram_token": "", "chat_id": ""}
    
    # Mascara o token
    token = config["telegram_token"]
    masked_token = f"{token[:10]}...{token[-4:]}" if len(token) > 14 else "***"
    
    return {
        "configured": True,
        "telegram_token": masked_token,
        "chat_id": config["chat_id"]
    }


@api_router.post("/telegram/send-signal")
async def send_signal_to_telegram(request: SendSignalRequest):
    """Envia sinal para o Telegram"""
    try:
        # Busca o sinal
        signal = next((s for s in MOCK_SIGNALS if s["id"] == int(request.signal_id)), None)
        if not signal:
            raise HTTPException(status_code=404, detail="Sinal não encontrado")
        
        # Busca configuração do Telegram se não fornecida
        if not request.telegram_token or not request.chat_id:
            config = await db.telegram_configs.find_one({"user_id": "default_user"})
            if not config:
                raise HTTPException(status_code=400, detail="Telegram não configurado")
            
            token = config["telegram_token"]
            chat_id = config["chat_id"]
        else:
            token = request.telegram_token
            chat_id = request.chat_id
        
        # Formata e envia mensagem
        message = TelegramService.format_signal_message(signal)
        result = TelegramService.send_message(token, chat_id, message)
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["message"])
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Erro ao enviar sinal: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao enviar sinal: {str(e)}")


# ============ FAVORITES ROUTES ============

@api_router.post("/favorites/toggle")
async def toggle_favorite(request: ToggleFavoriteRequest):
    """Adiciona/remove favorito"""
    try:
        # Busca favoritos atuais
        favorites = await db.favorites.find_one({"user_id": "default_user"})
        
        if not favorites:
            favorites = Favorites().dict()
            await db.favorites.insert_one(favorites)
        
        # Toggle do favorito
        if request.type == "match" and request.match_id:
            match_id = str(request.match_id)
            if match_id in favorites["matches"]:
                favorites["matches"].remove(match_id)
            else:
                favorites["matches"].append(match_id)
        elif request.type == "league" and request.league_id is not None:
            league_id = request.league_id
            if league_id in favorites["leagues"]:
                favorites["leagues"].remove(league_id)
            else:
                favorites["leagues"].append(league_id)
        
        favorites["updated_at"] = datetime.utcnow()
        
        # Atualiza no banco
        await db.favorites.update_one(
            {"user_id": "default_user"},
            {"$set": favorites}
        )
        
        return {
            "success": True,
            "favorites": {
                "matches": favorites["matches"],
                "leagues": favorites["leagues"]
            }
        }
        
    except Exception as e:
        logging.error(f"Erro ao alternar favorito: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao alternar favorito: {str(e)}")


@api_router.get("/favorites")
async def get_favorites():
    """Retorna favoritos do usuário"""
    favorites = await db.favorites.find_one({"user_id": "default_user"})
    
    if not favorites:
        return {"matches": [], "leagues": []}
    
    return {
        "matches": favorites.get("matches", []),
        "leagues": favorites.get("leagues", [])
    }


# ============ MATCHES & SIGNALS ROUTES ============

@api_router.get("/matches")
async def get_matches(status: Optional[str] = "all"):
    """Retorna partidas (mock temporário)"""
    filtered_matches = MOCK_MATCHES
    
    if status == "live":
        filtered_matches = [m for m in MOCK_MATCHES if m["status"] == "LIVE"]
    elif status == "scheduled":
        filtered_matches = [m for m in MOCK_MATCHES if m["status"] == "SCHEDULED"]
    
    return {
        "matches": filtered_matches,
        "leagues": MOCK_LEAGUES
    }


@api_router.get("/signals")
async def get_signals():
    """Retorna sinais de alta probabilidade"""
    return {"signals": MOCK_SIGNALS}


# ============ HEALTH CHECK ============

@api_router.get("/")
async def root():
    return {"message": "SokkerPRO Clone API", "status": "running"}


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
