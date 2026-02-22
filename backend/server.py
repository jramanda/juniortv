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
from datetime import datetime, timezone
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(title="Corner Spotter API")

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
    chat_id: str
    enabled: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TelegramConfigCreate(BaseModel):
    bot_token: str
    chat_id: str
    enabled: bool = True

class TelegramConfigUpdate(BaseModel):
    bot_token: Optional[str] = None
    chat_id: Optional[str] = None
    enabled: Optional[bool] = None

class AnalysisSettings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    min_probability: float = 60.0  # Minimum probability percentage
    min_odds: float = 1.20
    max_odds: float = 2.50
    corner_lines: List[str] = Field(default_factory=lambda: ["8.5", "9.5", "10.5", "11.5"])
    auto_send_telegram: bool = True
    analyze_live: bool = True
    analyze_prematch: bool = True
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AnalysisSettingsUpdate(BaseModel):
    min_probability: Optional[float] = None
    min_odds: Optional[float] = None
    max_odds: Optional[float] = None
    corner_lines: Optional[List[str]] = None
    auto_send_telegram: Optional[bool] = None
    analyze_live: Optional[bool] = None
    analyze_prematch: Optional[bool] = None

class GameSignal(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    home_team: str
    away_team: str
    league: str
    match_time: str  # "45'" for live or "15:00" for prematch
    is_live: bool
    corner_line: str  # "Over 9.5"
    odds: float
    probability: float
    sent_to_telegram: bool = False
    telegram_sent_at: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class GameSignalCreate(BaseModel):
    home_team: str
    away_team: str
    league: str
    match_time: str
    is_live: bool
    corner_line: str
    odds: float
    probability: float

class TelegramMessage(BaseModel):
    message: str

class GameAnalysis(BaseModel):
    home_team: str
    away_team: str
    league: str
    match_time: str
    is_live: bool
    corners_data: List[dict]  # [{"line": "Over 9.5", "odds": 1.85}, ...]

# ============ HELPER FUNCTIONS ============

def calculate_probability(odds: float) -> float:
    """Convert decimal odds to implied probability percentage"""
    if odds <= 1:
        return 0.0
    return round((1 / odds) * 100, 1)

async def send_telegram_message(message: str) -> dict:
    """Send message to Telegram"""
    config = await db.telegram_config.find_one({}, {"_id": 0})
    if not config or not config.get("enabled"):
        return {"success": False, "error": "Telegram not configured or disabled"}
    
    bot_token = config.get("bot_token")
    chat_id = config.get("chat_id")
    
    if not bot_token or not chat_id:
        return {"success": False, "error": "Missing bot_token or chat_id"}
    
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json={
                "chat_id": chat_id,
                "text": message,
                "parse_mode": "HTML"
            })
            
            if response.status_code == 200:
                return {"success": True}
            else:
                return {"success": False, "error": response.text}
    except Exception as e:
        logger.error(f"Telegram error: {str(e)}")
        return {"success": False, "error": str(e)}

def format_signal_message(signal: dict) -> str:
    """Format signal for Telegram"""
    status = "🔴 AO VIVO" if signal.get("is_live") else "⏰ PRÉ-JOGO"
    prob_emoji = "🟢" if signal.get("probability", 0) >= 70 else "🟡" if signal.get("probability", 0) >= 50 else "🔴"
    
    message = f"""
<b>⚽ SINAL DE ESCANTEIOS</b>

{status}
<b>🏆 {signal.get('league', 'N/A')}</b>

<b>{signal.get('home_team', 'N/A')}</b> vs <b>{signal.get('away_team', 'N/A')}</b>
⏱️ {signal.get('match_time', 'N/A')}

📊 <b>{signal.get('corner_line', 'N/A')}</b>
💰 Odds: <b>{signal.get('odds', 'N/A')}</b>
{prob_emoji} Probabilidade: <b>{signal.get('probability', 0):.1f}%</b>

#CornerSpotter #Escanteios
"""
    return message

# ============ ROUTES ============

@api_router.get("/")
async def root():
    return {"message": "Corner Spotter API", "version": "1.0.0"}

# --- Telegram Config ---

@api_router.get("/telegram/config")
async def get_telegram_config():
    config = await db.telegram_config.find_one({}, {"_id": 0})
    if not config:
        return {"configured": False}
    # Mask token for security
    if config.get("bot_token"):
        config["bot_token_masked"] = config["bot_token"][:10] + "..." + config["bot_token"][-5:]
    return {"configured": True, **config}

@api_router.post("/telegram/config")
async def save_telegram_config(config: TelegramConfigCreate):
    existing = await db.telegram_config.find_one({})
    
    config_obj = TelegramConfig(**config.model_dump())
    doc = config_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    if existing:
        await db.telegram_config.update_one({}, {"$set": doc})
    else:
        await db.telegram_config.insert_one(doc.copy())
    
    return {"success": True, "message": "Telegram configuration saved"}

@api_router.put("/telegram/config")
async def update_telegram_config(config: TelegramConfigUpdate):
    update_data = {k: v for k, v in config.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    result = await db.telegram_config.update_one({}, {"$set": update_data})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Config not found")
    
    return {"success": True, "message": "Configuration updated"}

@api_router.post("/telegram/test")
async def test_telegram():
    result = await send_telegram_message("🔔 Teste do Corner Spotter!\n\nSua integração com Telegram está funcionando corretamente! ✅")
    if result["success"]:
        return {"success": True, "message": "Test message sent successfully"}
    raise HTTPException(status_code=400, detail=result.get("error", "Failed to send test message"))

@api_router.post("/telegram/send")
async def send_custom_message(msg: TelegramMessage):
    result = await send_telegram_message(msg.message)
    if result["success"]:
        return {"success": True}
    raise HTTPException(status_code=400, detail=result.get("error", "Failed to send message"))

# --- Analysis Settings ---

@api_router.get("/settings")
async def get_settings():
    settings = await db.analysis_settings.find_one({}, {"_id": 0})
    if not settings:
        # Return default settings
        default = AnalysisSettings()
        doc = default.model_dump()
        doc['updated_at'] = doc['updated_at'].isoformat()
        await db.analysis_settings.insert_one(doc.copy())
        # Return without _id
        return {k: v for k, v in doc.items() if k != '_id'}
    return settings

@api_router.put("/settings")
async def update_settings(settings: AnalysisSettingsUpdate):
    update_data = {k: v for k, v in settings.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    existing = await db.analysis_settings.find_one({})
    if existing:
        await db.analysis_settings.update_one({}, {"$set": update_data})
    else:
        default = AnalysisSettings(**update_data)
        doc = default.model_dump()
        doc['updated_at'] = doc['updated_at'].isoformat()
        await db.analysis_settings.insert_one(doc.copy())
    
    return {"success": True, "message": "Settings updated"}

# --- Signals ---

@api_router.get("/signals", response_model=List[dict])
async def get_signals(limit: int = 50):
    signals = await db.signals.find({}, {"_id": 0}).sort("created_at", -1).to_list(limit)
    return signals

@api_router.post("/signals")
async def create_signal(signal: GameSignalCreate):
    signal_obj = GameSignal(**signal.model_dump())
    doc = signal_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.signals.insert_one(doc)
    
    # Check if auto-send is enabled
    settings = await db.analysis_settings.find_one({}, {"_id": 0})
    if settings and settings.get("auto_send_telegram", True):
        message = format_signal_message(doc)
        result = await send_telegram_message(message)
        if result["success"]:
            await db.signals.update_one(
                {"id": doc["id"]},
                {"$set": {"sent_to_telegram": True, "telegram_sent_at": datetime.now(timezone.utc).isoformat()}}
            )
            doc["sent_to_telegram"] = True
    
    return {"success": True, "signal": doc}

@api_router.post("/signals/{signal_id}/send-telegram")
async def send_signal_to_telegram(signal_id: str):
    signal = await db.signals.find_one({"id": signal_id}, {"_id": 0})
    if not signal:
        raise HTTPException(status_code=404, detail="Signal not found")
    
    message = format_signal_message(signal)
    result = await send_telegram_message(message)
    
    if result["success"]:
        await db.signals.update_one(
            {"id": signal_id},
            {"$set": {"sent_to_telegram": True, "telegram_sent_at": datetime.now(timezone.utc).isoformat()}}
        )
        return {"success": True, "message": "Signal sent to Telegram"}
    
    raise HTTPException(status_code=400, detail=result.get("error", "Failed to send"))

@api_router.delete("/signals/{signal_id}")
async def delete_signal(signal_id: str):
    result = await db.signals.delete_one({"id": signal_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Signal not found")
    return {"success": True}

@api_router.delete("/signals")
async def clear_signals():
    await db.signals.delete_many({})
    return {"success": True, "message": "All signals cleared"}

# --- Game Analysis ---

@api_router.post("/analyze")
async def analyze_game(game: GameAnalysis):
    """Analyze a game and return signals for high probability corners"""
    settings = await db.analysis_settings.find_one({}, {"_id": 0})
    if not settings:
        settings = AnalysisSettings().model_dump()
    
    signals = []
    
    for corner in game.corners_data:
        line = corner.get("line", "")
        odds = corner.get("odds", 0)
        
        if not odds or odds <= 1:
            continue
        
        probability = calculate_probability(odds)
        
        # Check if meets criteria
        if (probability >= settings.get("min_probability", 60) and
            settings.get("min_odds", 1.2) <= odds <= settings.get("max_odds", 2.5)):
            
            signal_data = {
                "home_team": game.home_team,
                "away_team": game.away_team,
                "league": game.league,
                "match_time": game.match_time,
                "is_live": game.is_live,
                "corner_line": line,
                "odds": odds,
                "probability": probability
            }
            
            signals.append(signal_data)
    
    return {"signals": signals, "count": len(signals)}

# --- Stats ---

@api_router.get("/stats")
async def get_stats():
    total_signals = await db.signals.count_documents({})
    sent_signals = await db.signals.count_documents({"sent_to_telegram": True})
    live_signals = await db.signals.count_documents({"is_live": True})
    prematch_signals = await db.signals.count_documents({"is_live": False})
    
    # Average probability
    pipeline = [
        {"$group": {"_id": None, "avg_probability": {"$avg": "$probability"}}}
    ]
    avg_result = await db.signals.aggregate(pipeline).to_list(1)
    avg_probability = avg_result[0]["avg_probability"] if avg_result else 0
    
    return {
        "total_signals": total_signals,
        "sent_to_telegram": sent_signals,
        "live_signals": live_signals,
        "prematch_signals": prematch_signals,
        "avg_probability": round(avg_probability, 1) if avg_probability else 0
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
