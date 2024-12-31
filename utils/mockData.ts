import matchData from '@/data/response.json'

// Match Data Types
export interface MatchInfo {
  matchId: string
  mapId: string
  gameVersion: string
  gameLengthMillis: number
  region: string
  gameStartMillis: number
  provisioningFlowId: string
  isCompleted: boolean
  customGameName: string
  queueId: string
  gameMode: string
  isRanked: boolean
  seasonId: string
}

export interface AbilityCasts {
  grenadeCasts: number
  ability1Casts: number
  ability2Casts: number
  ultimateCasts: number
}

export interface PlayerStats {
  score: number
  roundsPlayed: number
  kills: number
  deaths: number
  assists: number
  playtimeMillis: number
  abilityCasts: AbilityCasts
}

export interface Player {
  puuid: string
  gameName: string
  tagLine: string
  teamId: string
  partyId: string
  characterId: string
  stats: PlayerStats
  competitiveTier: number
  isObserver: boolean
  playerCard: string
  playerTitle: string
  accountLevel: number
}

export interface Location {
  x: number
  y: number
}

export interface PlayerLocation {
  puuid: string
  viewRadians: number
  location: Location
}

export interface Kill {
  timeSinceGameStartMillis: number
  timeSinceRoundStartMillis: number
  killer: string
  victim: string
  victimLocation: Location
  assistants: string[]
  playerLocations: PlayerLocation[]
  finishingDamage: {
    damageType: string
    damageItem: string
    isSecondaryFireMode: boolean
  }
}

export interface RoundResult {
  roundNum: number
  roundResult: string
  roundCeremony: string
  winningTeam: string
  bombPlanter?: string
  bombDefuser?: string
  plantRoundTime?: number
  plantPlayerLocations?: PlayerLocation[]
  plantLocation?: Location
  plantSite?: string
  defuseRoundTime?: number
  defusePlayerLocations?: PlayerLocation[]
  defuseLocation?: Location
  playerStats: {
    puuid: string
    kills: Kill[]
    damage: {
      receiver: string
      damage: number
      legshots: number
      bodyshots: number
      headshots: number
    }[]
    score: number
    economy: {
      loadoutValue: number
      weapon: string
      armor: string
      remaining: number
      spent: number
    }
    ability: {
      grenadeEffects: null
      ability1Effects: null
      ability2Effects: null
      ultimateEffects: null
    }
  }[]
}

export interface MatchData {
  matchInfo: MatchInfo
  players: Player[]
  coaches: any[]
  teams: {
    teamId: string
    won: boolean
    roundsPlayed: number
    roundsWon: number
    numPoints: number
  }[]
  roundResults: RoundResult[]
}

// Export the actual match data
export const matchResponse: MatchData = matchData

// Helper function to get player performance data for useAgentAnalytics
export const getPlayerPerformances = () => {
  return matchResponse.players.map((player) => ({
    puuid: player.puuid,
    agentId: player.characterId,
    kills: player.stats.kills,
    deaths: player.stats.deaths,
    assists: player.stats.assists,
    score: player.stats.score,
    utilityUsage: player.stats.abilityCasts,
    kda:
      (player.stats.kills + player.stats.assists) /
      Math.max(1, player.stats.deaths)
  }))
}

// Helper function to get match info
export const getMatchInfo = () => matchResponse.matchInfo

// Add these new interfaces
export interface DashboardPlayer {
  id: string
  name: string
  score: number
  rank: number
}

export interface Recommendation {
  id: string
  title: string
  description: string
  confidence: number
  actions: string[]
}

// Add these new generator functions
export const generatePlayers = (
  count: number
): DashboardPlayer[] => {
  return Array(count)
    .fill(null)
    .map(() => ({
      id: Math.random().toString(36).substr(2, 9),
      name: `Player ${Math.floor(Math.random() * 1000)}`,
      score: Math.floor(Math.random() * 10000),
      rank: Math.floor(Math.random() * 100)
    }))
}

export const generateRecommendations = (
  count: number
): Recommendation[] => {
  return Array(count)
    .fill(null)
    .map(() => ({
      id: Math.random().toString(36).substr(2, 9),
      title: `Recommendation ${Math.floor(
        Math.random() * 100
      )}`,
      description: 'This is a sample recommendation.',
      confidence: Math.random(),
      actions: ['Action item 1', 'Action item 2']
    }))
}
