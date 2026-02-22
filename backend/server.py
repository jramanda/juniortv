from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import httpx
import random

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============ MODELS ============

class TelegramConfig(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    bot_token: str
    group_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TelegramConfigCreate(BaseModel):
    bot_token: str
    group_id: str

class TelegramMessage(BaseModel):
    message: str
    game_ids: Optional[List[str]] = None

class TeamStats(BaseModel):
    name: str
    logo: Optional[str] = None
    avg_corners_for: float
    avg_corners_against: float
    last_5_corners: List[float] = []

class Match(BaseModel):
    id: str
    league: str
    league_logo: Optional[str] = None
    country: str
    home_team: TeamStats
    away_team: TeamStats
    match_date: datetime
    status: str  # scheduled, live, finished
    predicted_corners: float
    probability_over_9: float
    actual_corners: Optional[int] = None
    is_high_probability: bool = False

class LeagueFilter(BaseModel):
    id: str
    name: str
    country: str
    logo: Optional[str] = None

# ============ MOCK DATA ============

LEAGUES = [
    {"id": "39", "name": "Premier League", "country": "England", "logo": "https://media.api-sports.io/football/leagues/39.png"},
    {"id": "140", "name": "La Liga", "country": "Spain", "logo": "https://media.api-sports.io/football/leagues/140.png"},
    {"id": "135", "name": "Serie A", "country": "Italy", "logo": "https://media.api-sports.io/football/leagues/135.png"},
    {"id": "78", "name": "Bundesliga", "country": "Germany", "logo": "https://media.api-sports.io/football/leagues/78.png"},
    {"id": "61", "name": "Ligue 1", "country": "France", "logo": "https://media.api-sports.io/football/leagues/61.png"},
    {"id": "71", "name": "Brasileirao Serie A", "country": "Brazil", "logo": "https://media.api-sports.io/football/leagues/71.png"},
    {"id": "94", "name": "Primeira Liga", "country": "Portugal", "logo": "https://media.api-sports.io/football/leagues/94.png"},
    {"id": "88", "name": "Eredivisie", "country": "Netherlands", "logo": "https://media.api-sports.io/football/leagues/88.png"},
]

TEAMS_BY_LEAGUE = {
    "39": [  # Premier League
        {"name": "Manchester City", "avg_corners_for": 6.8, "avg_corners_against": 3.2},
        {"name": "Arsenal", "avg_corners_for": 6.5, "avg_corners_against": 3.5},
        {"name": "Liverpool", "avg_corners_for": 6.2, "avg_corners_against": 3.8},
        {"name": "Chelsea", "avg_corners_for": 5.8, "avg_corners_against": 4.2},
        {"name": "Manchester United", "avg_corners_for": 5.5, "avg_corners_against": 4.5},
        {"name": "Tottenham", "avg_corners_for": 5.3, "avg_corners_against": 4.7},
        {"name": "Newcastle", "avg_corners_for": 5.0, "avg_corners_against": 4.8},
        {"name": "Brighton", "avg_corners_for": 5.5, "avg_corners_against": 4.3},
    ],
    "140": [  # La Liga
        {"name": "Real Madrid", "avg_corners_for": 6.5, "avg_corners_against": 3.5},
        {"name": "Barcelona", "avg_corners_for": 7.0, "avg_corners_against": 3.0},
        {"name": "Atletico Madrid", "avg_corners_for": 5.2, "avg_corners_against": 4.2},
        {"name": "Sevilla", "avg_corners_for": 5.0, "avg_corners_against": 4.8},
        {"name": "Real Sociedad", "avg_corners_for": 5.5, "avg_corners_against": 4.5},
        {"name": "Villarreal", "avg_corners_for": 5.3, "avg_corners_against": 4.3},
    ],
    "135": [  # Serie A
        {"name": "Inter Milan", "avg_corners_for": 6.0, "avg_corners_against": 3.8},
        {"name": "AC Milan", "avg_corners_for": 5.8, "avg_corners_against": 4.0},
        {"name": "Juventus", "avg_corners_for": 5.5, "avg_corners_against": 4.2},
        {"name": "Napoli", "avg_corners_for": 6.2, "avg_corners_against": 3.5},
        {"name": "Roma", "avg_corners_for": 5.3, "avg_corners_against": 4.5},
        {"name": "Lazio", "avg_corners_for": 5.0, "avg_corners_against": 4.8},
    ],
    "78": [  # Bundesliga
        {"name": "Bayern Munich", "avg_corners_for": 7.2, "avg_corners_against": 2.8},
        {"name": "Borussia Dortmund", "avg_corners_for": 6.0, "avg_corners_against": 4.0},
        {"name": "RB Leipzig", "avg_corners_for": 5.8, "avg_corners_against": 4.2},
        {"name": "Bayer Leverkusen", "avg_corners_for": 6.5, "avg_corners_against": 3.5},
        {"name": "Wolfsburg", "avg_corners_for": 5.0, "avg_corners_against": 4.8},
    ],
    "61": [  # Ligue 1
        {"name": "PSG", "avg_corners_for": 7.5, "avg_corners_against": 2.5},
        {"name": "Marseille", "avg_corners_for": 5.8, "avg_corners_against": 4.0},
        {"name": "Lyon", "avg_corners_for": 5.5, "avg_corners_against": 4.3},
        {"name": "Monaco", "avg_corners_for": 5.3, "avg_corners_against": 4.5},
        {"name": "Lille", "avg_corners_for": 5.0, "avg_corners_against": 4.8},
    ],
    "71": [  # Brasileirao
        {"name": "Flamengo", "avg_corners_for": 6.0, "avg_corners_against": 4.0},
        {"name": "Palmeiras", "avg_corners_for": 5.8, "avg_corners_against": 4.2},
        {"name": "Corinthians", "avg_corners_for": 5.5, "avg_corners_against": 4.5},
        {"name": "Sao Paulo", "avg_corners_for": 5.3, "avg_corners_against": 4.7},
        {"name": "Santos", "avg_corners_for": 5.0, "avg_corners_against": 5.0},
        {"name": "Gremio", "avg_corners_for": 5.2, "avg_corners_against": 4.8},
    ],
    "94": [  # Primeira Liga
        {"name": "Benfica", "avg_corners_for": 6.5, "avg_corners_against": 3.5},
        {"name": "Porto", "avg_corners_for": 6.2, "avg_corners_against": 3.8},
        {"name": "Sporting CP", "avg_corners_for": 6.0, "avg_corners_against": 4.0},
        {"name": "Braga", "avg_corners_for": 5.5, "avg_corners_against": 4.5},
    ],
    "88": [  # Eredivisie
        {"name": "Ajax", "avg_corners_for": 6.8, "avg_corners_against": 3.2},
        {"name": "PSV", "avg_corners_for": 6.5, "avg_corners_against": 3.5},
        {"name": "Feyenoord", "avg_corners_for": 6.0, "avg_corners_against": 4.0},
        {"name": "AZ Alkmaar", "avg_corners_for": 5.5, "avg_corners_against": 4.5},
    ],
}

# Cache for consistent match data
_match_cache = {"matches": None, "generated_at": None}

def generate_mock_matches() -> List[dict]:
    """Generate realistic mock matches for today and tomorrow"""
    global _match_cache
    
    # Use cached data if generated within last hour
    now = datetime.now(timezone.utc)
    if _match_cache["matches"] is not None and _match_cache["generated_at"] is not None:
        time_diff = (now - _match_cache["generated_at"]).total_seconds()
        if time_diff < 3600:  # 1 hour cache
            return _match_cache["matches"]
    
    # Seed random for consistent results within the same day
    day_seed = int(now.strftime("%Y%m%d"))
    random.seed(day_seed)
    
    matches = []
    today = now.replace(hour=0, minute=0, second=0, microsecond=0)
    
    for league in LEAGUES:
        teams = TEAMS_BY_LEAGUE.get(league["id"], [])
        if len(teams) < 2:
            continue
            
        # Generate 2-4 matches per league
        num_matches = random.randint(2, 4)
        available_teams = teams.copy()
        random.shuffle(available_teams)
        
        for i in range(0, min(num_matches * 2, len(available_teams)), 2):
            if i + 1 >= len(available_teams):
                break
                
            home = available_teams[i]
            away = available_teams[i + 1]
            
            # Random match time (today or tomorrow)
            day_offset = random.randint(0, 1)
            hour = random.choice([14, 15, 16, 17, 18, 19, 20, 21])
            match_date = today + timedelta(days=day_offset, hours=hour)
            
            # Calculate predicted corners
            predicted_corners = (
                home["avg_corners_for"] + 
                away["avg_corners_for"] + 
                home["avg_corners_against"] + 
                away["avg_corners_against"]
            ) / 2
            
            # Add some variance
            predicted_corners += random.uniform(-1.5, 1.5)
            predicted_corners = round(predicted_corners, 1)
            
            # Calculate probability over 9 corners
            # Based on predicted corners - higher predicted = higher probability
            base_prob = 50 + (predicted_corners - 9) * 10
            probability = max(15, min(92, base_prob + random.uniform(-8, 8)))
            probability = round(probability, 0)
            
            is_high_prob = predicted_corners > 9 or probability > 65
            
            match_id = str(uuid.uuid4())[:8]
            
            # Generate last 5 corners for teams
            home_last_5 = [round(random.uniform(home["avg_corners_for"] - 2, home["avg_corners_for"] + 3), 0) for _ in range(5)]
            away_last_5 = [round(random.uniform(away["avg_corners_for"] - 2, away["avg_corners_for"] + 3), 0) for _ in range(5)]
            
            match = {
                "id": match_id,
                "league": league["name"],
                "league_logo": league["logo"],
                "country": league["country"],
                "home_team": {
                    "name": home["name"],
                    "logo": None,
                    "avg_corners_for": home["avg_corners_for"],
                    "avg_corners_against": home["avg_corners_against"],
                    "last_5_corners": home_last_5
                },
                "away_team": {
                    "name": away["name"],
                    "logo": None,
                    "avg_corners_for": away["avg_corners_for"],
                    "avg_corners_against": away["avg_corners_against"],
                    "last_5_corners": away_last_5
                },
                "match_date": match_date.isoformat(),
                "status": "scheduled",
                "predicted_corners": predicted_corners,
                "probability_over_9": probability,
                "actual_corners": None,
                "is_high_probability": is_high_prob
            }
            matches.append(match)
    
    # Sort by match date
    matches.sort(key=lambda x: x["match_date"])
    
    # Cache the results
    _match_cache["matches"] = matches
    _match_cache["generated_at"] = now
    
    # Reset random seed
    random.seed()
    
    return matches

# ============ API ROUTES ============

@api_router.get("/")
async def root():
    return {"message": "CornerKick Pro API - Football Statistics"}

@api_router.get("/leagues", response_model=List[LeagueFilter])
async def get_leagues():
    """Get all available leagues"""
    return LEAGUES

@api_router.get("/matches")
async def get_matches(
    league_id: Optional[str] = None,
    high_probability_only: bool = False,
    date: Optional[str] = None
):
    """Get matches with corner statistics"""
    matches = generate_mock_matches()
    
    # Filter by league
    if league_id:
        league_name = next((l["name"] for l in LEAGUES if l["id"] == league_id), None)
        if league_name:
            matches = [m for m in matches if m["league"] == league_name]
    
    # Filter high probability only (>9 predicted corners or >65% probability)
    if high_probability_only:
        matches = [m for m in matches if m["is_high_probability"]]
    
    # Filter by date
    if date:
        try:
            filter_date = datetime.fromisoformat(date.replace('Z', '+00:00'))
            matches = [m for m in matches if m["match_date"][:10] == date[:10]]
        except:
            pass
    
    return {
        "total": len(matches),
        "matches": matches,
        "high_probability_count": len([m for m in matches if m["is_high_probability"]])
    }

@api_router.get("/matches/{match_id}")
async def get_match_detail(match_id: str):
    """Get detailed match statistics"""
    matches = generate_mock_matches()
    match = next((m for m in matches if m["id"] == match_id), None)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    return match

# ============ TELEGRAM ROUTES ============

@api_router.post("/telegram/config")
async def save_telegram_config(config: TelegramConfigCreate):
    """Save Telegram bot configuration"""
    # Check if config already exists
    existing = await db.telegram_config.find_one({}, {"_id": 0})
    
    config_doc = {
        "id": str(uuid.uuid4()),
        "bot_token": config.bot_token,
        "group_id": config.group_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    if existing:
        await db.telegram_config.update_one(
            {"id": existing["id"]},
            {"$set": {
                "bot_token": config.bot_token,
                "group_id": config.group_id,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        config_doc["id"] = existing["id"]
    else:
        await db.telegram_config.insert_one(config_doc)
    
    return {"success": True, "message": "Configuracao salva com sucesso!", "id": config_doc["id"]}

@api_router.get("/telegram/config")
async def get_telegram_config():
    """Get current Telegram configuration"""
    config = await db.telegram_config.find_one({}, {"_id": 0})
    if not config:
        return {"configured": False}
    
    # Mask the token for security
    masked_token = config["bot_token"][:10] + "..." + config["bot_token"][-5:] if len(config["bot_token"]) > 15 else "***"
    
    return {
        "configured": True,
        "group_id": config["group_id"],
        "masked_token": masked_token,
        "updated_at": config.get("updated_at")
    }

@api_router.post("/telegram/send")
async def send_telegram_message(message_data: TelegramMessage):
    """Send message to Telegram group"""
    config = await db.telegram_config.find_one({}, {"_id": 0})
    if not config:
        raise HTTPException(status_code=400, detail="Telegram nao configurado. Configure o bot primeiro.")
    
    bot_token = config["bot_token"]
    group_id = config["group_id"]
    
    # Validate token format
    if not bot_token or len(bot_token) < 30:
        raise HTTPException(status_code=400, detail="Token do bot invalido. Verifique a configuracao.")
    
    # Build message
    message = message_data.message
    
    # If game_ids provided, add match info
    if message_data.game_ids:
        matches = generate_mock_matches()
        selected_matches = [m for m in matches if m["id"] in message_data.game_ids]
        
        if selected_matches:
            message += "\n\n🎯 *JOGOS SELECIONADOS:*\n"
            for match in selected_matches:
                message += f"\n⚽ {match['home_team']['name']} vs {match['away_team']['name']}"
                message += f"\n📊 Previsao: {match['predicted_corners']} corners"
                message += f"\n📈 Prob. Over 9: {match['probability_over_9']}%"
                message += f"\n🏆 {match['league']}\n"
    
    # Send to Telegram
    telegram_url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    
    try:
        async with httpx.AsyncClient(timeout=15.0) as http_client:
            response = await http_client.post(
                telegram_url,
                json={
                    "chat_id": group_id,
                    "text": message,
                    "parse_mode": "Markdown"
                }
            )
            
            result = response.json()
            
            if response.status_code == 200 and result.get("ok"):
                # Log successful send
                await db.telegram_logs.insert_one({
                    "id": str(uuid.uuid4()),
                    "message": message,
                    "game_ids": message_data.game_ids,
                    "sent_at": datetime.now(timezone.utc).isoformat(),
                    "status": "success"
                })
                return {"success": True, "message": "Mensagem enviada com sucesso!"}
            else:
                error_msg = result.get('description', 'Erro desconhecido')
                # Log failed send
                await db.telegram_logs.insert_one({
                    "id": str(uuid.uuid4()),
                    "message": message,
                    "game_ids": message_data.game_ids,
                    "sent_at": datetime.now(timezone.utc).isoformat(),
                    "status": "failed",
                    "error": error_msg
                })
                raise HTTPException(status_code=400, detail=f"Erro Telegram: {error_msg}")
                
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Timeout ao conectar com Telegram. Tente novamente.")
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail="Erro de conexao com Telegram. Verifique sua internet.")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Telegram error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao enviar: {str(e)}")

@api_router.post("/telegram/send-high-probability")
async def send_high_probability_games():
    """Send all high probability games to Telegram"""
    config = await db.telegram_config.find_one({}, {"_id": 0})
    if not config:
        raise HTTPException(status_code=400, detail="Telegram nao configurado")
    
    matches = generate_mock_matches()
    high_prob_matches = [m for m in matches if m["is_high_probability"]]
    
    if not high_prob_matches:
        raise HTTPException(status_code=404, detail="Nenhum jogo de alta probabilidade encontrado")
    
    message = "🔥 *CORNERKICK PRO - ALERTAS*\n"
    message += f"📅 {datetime.now(timezone.utc).strftime('%d/%m/%Y')}\n"
    message += f"\n🎯 *{len(high_prob_matches)} JOGOS COM ALTA PROBABILIDADE DE +9 CORNERS:*\n"
    
    for match in high_prob_matches[:10]:  # Limit to 10 matches
        match_time = datetime.fromisoformat(match["match_date"].replace('Z', '+00:00'))
        message += f"\n⚽ *{match['home_team']['name']}* vs *{match['away_team']['name']}*"
        message += f"\n⏰ {match_time.strftime('%H:%M')} | 🏆 {match['league']}"
        message += f"\n📊 Previsao: *{match['predicted_corners']}* corners"
        message += f"\n📈 Probabilidade: *{match['probability_over_9']}%*\n"
    
    bot_token = config["bot_token"]
    group_id = config["group_id"]
    telegram_url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                telegram_url,
                json={
                    "chat_id": group_id,
                    "text": message,
                    "parse_mode": "Markdown"
                },
                timeout=10.0
            )
            
            if response.status_code == 200 and response.json().get("ok"):
                return {"success": True, "message": f"Enviados {len(high_prob_matches)} jogos!"}
            else:
                raise HTTPException(status_code=400, detail="Erro ao enviar")
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/telegram/logs")
async def get_telegram_logs():
    """Get Telegram message logs"""
    logs = await db.telegram_logs.find({}, {"_id": 0}).sort("sent_at", -1).to_list(50)
    return {"logs": logs}

# ============ STATISTICS ROUTES ============

@api_router.get("/stats/summary")
async def get_stats_summary():
    """Get summary statistics"""
    matches = generate_mock_matches()
    
    total_matches = len(matches)
    high_prob_count = len([m for m in matches if m["is_high_probability"]])
    avg_corners = sum(m["predicted_corners"] for m in matches) / total_matches if total_matches > 0 else 0
    
    # Matches by league
    leagues_stats = {}
    for match in matches:
        league = match["league"]
        if league not in leagues_stats:
            leagues_stats[league] = {"count": 0, "high_prob": 0, "avg_corners": 0, "total_corners": 0}
        leagues_stats[league]["count"] += 1
        leagues_stats[league]["total_corners"] += match["predicted_corners"]
        if match["is_high_probability"]:
            leagues_stats[league]["high_prob"] += 1
    
    for league in leagues_stats:
        leagues_stats[league]["avg_corners"] = round(
            leagues_stats[league]["total_corners"] / leagues_stats[league]["count"], 1
        )
    
    return {
        "total_matches": total_matches,
        "high_probability_matches": high_prob_count,
        "average_predicted_corners": round(avg_corners, 1),
        "leagues": leagues_stats
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
