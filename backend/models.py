from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid


class TelegramConfig(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    telegram_token: str
    chat_id: str
    user_id: str = "default_user"  # Futuramente será por usuário autenticado
    created_at: datetime = Field(default_factory=datetime.utcnow)


class TelegramConfigCreate(BaseModel):
    telegram_token: str
    chat_id: str


class TelegramConfigResponse(BaseModel):
    telegram_token: str  # masked
    chat_id: str
    configured: bool


class SendSignalRequest(BaseModel):
    signal_id: str
    telegram_token: Optional[str] = None
    chat_id: Optional[str] = None


class Favorites(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str = "default_user"
    matches: List[str] = Field(default_factory=list)
    leagues: List[int] = Field(default_factory=list)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ToggleFavoriteRequest(BaseModel):
    match_id: Optional[str] = None
    league_id: Optional[int] = None
    type: str  # 'match' or 'league'


class TeamData(BaseModel):
    name: str
    logo: str
    score: Optional[int] = None


class MatchStats(BaseModel):
    possession: Dict[str, int]
    shots: Dict[str, int]
    shotsOnTarget: Dict[str, int]
    corners: Dict[str, int]
    fouls: Dict[str, int]


class Match(BaseModel):
    id: int
    leagueId: int
    leagueName: str
    homeTeam: TeamData
    awayTeam: TeamData
    status: str
    minute: Optional[str] = None
    time: str
    probability: Optional[int] = None
    stats: Optional[MatchStats] = None


class League(BaseModel):
    id: int
    name: str
    country: str
    flag: str
    matches: int


class Signal(BaseModel):
    id: int
    matchId: int
    homeTeam: str
    awayTeam: str
    probability: int
    prediction: str
    reason: str
    timestamp: str
    status: str
    league: str
