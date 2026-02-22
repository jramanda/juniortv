// Mock data para o clone do SokkerPRO

export const mockLeagues = [
  {
    id: 1,
    name: "BRAZIL Série A",
    country: "Brazil",
    flag: "🇧🇷",
    matches: 3
  },
  {
    id: 2,
    name: "ENGLAND Premier League",
    country: "England",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    matches: 5
  },
  {
    id: 3,
    name: "SPAIN La Liga",
    country: "Spain",
    flag: "🇪🇸",
    matches: 4
  },
  {
    id: 4,
    name: "UEFA Champions League",
    country: "Europe",
    flag: "🇪🇺",
    matches: 6
  }
];

export const mockMatches = [
  {
    id: 1,
    leagueId: 1,
    leagueName: "BRAZIL Série A",
    homeTeam: {
      name: "Flamengo",
      logo: "⚽",
      score: 2
    },
    awayTeam: {
      name: "Palmeiras",
      score: 1,
      logo: "⚽"
    },
    status: "LIVE",
    minute: "67'",
    time: "20:30",
    probability: 78,
    stats: {
      possession: { home: 58, away: 42 },
      shots: { home: 14, away: 8 },
      shotsOnTarget: { home: 7, away: 3 },
      corners: { home: 6, away: 2 },
      fouls: { home: 8, away: 12 }
    }
  },
  {
    id: 2,
    leagueId: 1,
    leagueName: "BRAZIL Série A",
    homeTeam: {
      name: "Corinthians",
      logo: "⚽",
      score: 1
    },
    awayTeam: {
      name: "São Paulo",
      score: 1,
      logo: "⚽"
    },
    status: "LIVE",
    minute: "45'+2",
    time: "18:00",
    probability: 65,
    stats: {
      possession: { home: 52, away: 48 },
      shots: { home: 9, away: 11 },
      shotsOnTarget: { home: 4, away: 5 },
      corners: { home: 3, away: 4 },
      fouls: { home: 7, away: 6 }
    }
  },
  {
    id: 3,
    leagueId: 2,
    leagueName: "ENGLAND Premier League",
    homeTeam: {
      name: "Manchester United",
      logo: "⚽",
      score: 0
    },
    awayTeam: {
      name: "Liverpool",
      score: 2,
      logo: "⚽"
    },
    status: "LIVE",
    minute: "82'",
    time: "16:30",
    probability: 85,
    stats: {
      possession: { home: 45, away: 55 },
      shots: { home: 8, away: 16 },
      shotsOnTarget: { home: 2, away: 9 },
      corners: { home: 3, away: 8 },
      fouls: { home: 11, away: 7 }
    }
  },
  {
    id: 4,
    leagueId: 2,
    leagueName: "ENGLAND Premier League",
    homeTeam: {
      name: "Arsenal",
      logo: "⚽",
      score: 3
    },
    awayTeam: {
      name: "Chelsea",
      score: 1,
      logo: "⚽"
    },
    status: "LIVE",
    minute: "71'",
    time: "14:00",
    probability: 72,
    stats: {
      possession: { home: 61, away: 39 },
      shots: { home: 18, away: 7 },
      shotsOnTarget: { home: 10, away: 4 },
      corners: { home: 9, away: 2 },
      fouls: { home: 5, away: 13 }
    }
  },
  {
    id: 5,
    leagueId: 3,
    leagueName: "SPAIN La Liga",
    homeTeam: {
      name: "Real Madrid",
      logo: "⚽",
      score: null
    },
    awayTeam: {
      name: "Barcelona",
      score: null,
      logo: "⚽"
    },
    status: "SCHEDULED",
    minute: null,
    time: "21:00",
    probability: 88,
    stats: null
  },
  {
    id: 6,
    leagueId: 4,
    leagueName: "UEFA Champions League",
    homeTeam: {
      name: "Bayern Munich",
      logo: "⚽",
      score: 1
    },
    awayTeam: {
      name: "PSG",
      score: 0,
      logo: "⚽"
    },
    status: "LIVE",
    minute: "38'",
    time: "17:00",
    probability: 91,
    stats: {
      possession: { home: 68, away: 32 },
      shots: { home: 12, away: 3 },
      shotsOnTarget: { home: 6, away: 1 },
      corners: { home: 7, away: 1 },
      fouls: { home: 4, away: 9 }
    }
  }
];

export const mockSignals = [
  {
    id: 1,
    matchId: 1,
    homeTeam: "Flamengo",
    awayTeam: "Palmeiras",
    probability: 78,
    prediction: "Mais de 2.5 gols",
    reason: "Alta média de gols nos últimos jogos (3.2 gols/jogo)",
    timestamp: new Date().toISOString(),
    status: "ACTIVE",
    league: "BRAZIL Série A"
  },
  {
    id: 2,
    matchId: 3,
    homeTeam: "Manchester United",
    awayTeam: "Liverpool",
    probability: 85,
    prediction: "Ambas equipes marcam",
    reason: "Últimos 5 confrontos tiveram gols dos dois times",
    timestamp: new Date().toISOString(),
    status: "ACTIVE",
    league: "ENGLAND Premier League"
  },
  {
    id: 3,
    matchId: 6,
    homeTeam: "Bayern Munich",
    awayTeam: "PSG",
    probability: 91,
    prediction: "Mais de 3.5 gols",
    reason: "Média combinada de 4.1 gols nos últimos 10 jogos",
    timestamp: new Date().toISOString(),
    status: "ACTIVE",
    league: "UEFA Champions League"
  }
];

export const mockFavorites = {
  teams: ["Flamengo", "Liverpool", "Real Madrid"],
  leagues: [1, 2, 4]
};
