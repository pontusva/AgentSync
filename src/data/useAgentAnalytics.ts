// hooks/useAgentAnalytics.ts
import { useState, useEffect } from 'react'

interface PlayerPerformance {
  puuid: string
  agentId: string
  kills: number
  deaths: number
  assists: number
  score: number
  utilityUsage: {
    grenadeCasts: number
    ability1Casts: number
    ability2Casts: number
    ultimateCasts: number
  }
}

interface AgentRecommendation {
  agentId: string
  confidence: number
  reasons: string[]
}

interface PerformanceReason {
  text: string
  weight: number // Weight factor for confidence calculation
}

// Move agent roles to a separate constant at the top level
export const AGENT_ROLES = {
  // Duelists
  'add6443a-41bd-e414-f6ad-e58d267f4e95': 'Duelist', // Jett
  'bb2a4828-46eb-8cd1-e765-15848195d751': 'Duelist', // Neon
  '7f94d92c-4234-0a36-9646-3a87eb8b5c89': 'Duelist', // Raze
  'dade69b4-4f5a-8528-247b-219e5a1facd6': 'Duelist', // Phoenix
  '320b2a48-4d9b-a075-30f1-1f93a9b638fa': 'Duelist', // Yoru
  'a3bfb853-43b2-7238-a4f1-ad90e9e46bcc': 'Duelist', // Reyna

  // Initiators
  'f94c3b30-42be-e959-889c-5aa313dba261': 'Initiator', // Fade
  '601dbbe7-43ce-be57-2a40-4abd24953621': 'Initiator', // KAY/O
  '6f2a04ca-43e0-be17-7f36-b3908627744d': 'Initiator', // Skye
  '1e58de9c-4950-5125-93e9-a0aee9f98746': 'Initiator', // Sova
  '95b78ed7-4637-86d9-7e41-71ba8c293152': 'Initiator', // Breach
  '0e38b510-41a8-5780-5e8f-568b2a4f2d6c': 'Initiator', // Gekko

  // Controllers
  '22697a3d-45bf-8dd7-4fec-84a9e28c69d7': 'Controller', // Brimstone
  '41fb69c1-4189-7b37-f117-bcaf1e96f1bf': 'Controller', // Astra
  '9f0d8ba9-4140-b941-57d3-a7ad57c6b417': 'Controller', // Viper
  '8e253930-4c05-31dd-1b6c-968525494517': 'Controller', // Omen
  'cc8b64c8-4b25-4ff9-6e7f-37b4da43d235': 'Controller', // Harbor

  // Sentinels
  '569fdd95-4d10-43ab-ca70-79becc718b46': 'Sentinel', // Sage
  'a89a9b76-47fa-9171-aa7d-5e80b3e58a7f': 'Sentinel', // Deadlock
  '117ed9e3-49f3-6512-3ccf-0cada7e3823b': 'Sentinel', // Cypher
  '707eab51-4836-f488-046a-cda6bf494859': 'Sentinel', // Killjoy
  'e370fa57-4757-3604-3648-499e1f642d3f': 'Sentinel', // Chamber
  deadeye: 'Sentinel' // Iso
} as const

const useAgentAnalytics = (matchData: any) => {
  const [topPerformers, setTopPerformers] = useState<
    PlayerPerformance[]
  >([])
  const [recommendations, setRecommendations] = useState<
    AgentRecommendation[]
  >([])

  useEffect(() => {
    if (!matchData) return

    // Extract player performances
    const performances = matchData.players.map(
      (player: any) => ({
        puuid: player.puuid,
        agentId: player.characterId,
        kills: player.stats.kills,
        deaths: player.stats.deaths,
        assists: player.stats.assists,
        score: player.stats.score,
        utilityUsage: player.stats.abilityCasts,
        kda:
          (player.stats.kills + player.stats.assists) /
          Math.max(1, player.stats.deaths),
        impact: calculateImpactScore(player)
      })
    )

    // Sort by impact score
    const sortedPerformances = performances.sort(
      (a, b) => b.impact - a.impact
    )
    setTopPerformers(sortedPerformances)

    // Generate recommendations
    const recommendedAgents = analyzeTopPerformers(
      sortedPerformances,
      matchData.matchInfo.mapId
    )
    setRecommendations(recommendedAgents)
  }, [matchData])

  const calculateImpactScore = (player: any): number => {
    const kda =
      (player.stats.kills + player.stats.assists) /
      Math.max(1, player.stats.deaths)
    const utilityImpact = Object.values(
      player.stats.abilityCasts
    ).reduce((sum: number, casts: number) => sum + casts, 0)
    const scoreImpact = player.stats.score / 1000 // Normalize score

    return (
      kda * 0.4 + utilityImpact * 0.3 + scoreImpact * 0.3
    )
  }

  const analyzeTopPerformers = (
    performances: PlayerPerformance[],
    mapId: string
  ): AgentRecommendation[] => {
    // Count successful agents and their roles
    const successfulAgents = performances
      .filter((p) => p.kda > 1)
      .reduce((acc: { [key: string]: number }, curr) => {
        acc[curr.agentId] = (acc[curr.agentId] || 0) + 1
        return acc
      }, {})

    // Generate recommendations based on success patterns
    return Object.entries(successfulAgents)
      .map(
        ([agentId, frequency]): AgentRecommendation => ({
          agentId,
          confidence: calculateConfidence(
            frequency,
            performances.length,
            performances.find((p) => p.agentId === agentId),
            mapId,
            performances
          ),
          reasons: generateReasons(
            agentId,
            mapId,
            performances
          )
        })
      )
      .sort((a, b) => b.confidence - a.confidence)
  }

  const calculateConfidence = (
    frequency: number,
    totalPlayers: number,
    agentPerformance: PlayerPerformance | undefined,
    mapId: string,
    performances: PlayerPerformance[]
  ): number => {
    if (!agentPerformance) return 0

    const reasons = generateReasons(
      agentPerformance.agentId,
      mapId,
      performances
    )
    const weightedConfidence = reasons.reduce(
      (total, reason) => total + reason.weight,
      0
    )

    // Base confidence from frequency
    const baseConfidence =
      (frequency / (totalPlayers / 2)) * 100

    // Apply weighted modifications
    const finalConfidence =
      baseConfidence * (1 + weightedConfidence)

    return Math.max(0, Math.round(finalConfidence))
  }

  const generateReasons = (
    agentId: string,
    mapId: string,
    performances: PlayerPerformance[]
  ): PerformanceReason[] => {
    const reasons: PerformanceReason[] = []
    const agentPerformance = performances.find(
      (p) => p.agentId === agentId
    )

    if (!agentPerformance) return reasons

    // KDA performance (highest weight as it's most important)
    if (agentPerformance.kda > 2) {
      reasons.push({
        text: 'Strong KDA performance on this map',
        weight: 1.0
      })
    } else if (agentPerformance.kda < 1) {
      reasons.push({
        text: 'Below average KDA performance',
        weight: -1.0
      })
    }

    // Utility usage (medium weight)
    const totalUtility = Object.values(
      agentPerformance.utilityUsage
    ).reduce((sum, casts) => sum + casts, 0)
    if (agentPerformance.utilityUsage.ultimateCasts > 1) {
      reasons.push({
        text: 'Effective ultimate usage',
        weight: 0.5
      })
    } else if (
      agentPerformance.utilityUsage.ultimateCasts === 0
    ) {
      reasons.push({
        text: 'No ultimate abilities used',
        weight: -0.5
      })
    }

    if (totalUtility < 3) {
      reasons.push({
        text: 'Limited utility usage',
        weight: -0.3
      })
    }

    // Score-based feedback (medium-low weight)
    if (agentPerformance.score < 200) {
      reasons.push({
        text: 'Low overall impact score',
        weight: -0.4
      })
    }

    // Map-specific reasons (high weight as they're specific advantages)
    const mapSpecificStrengths: {
      [key: string]: { [key: string]: string }
    } = {
      '/Game/Maps/Port/Port': {
        'add6443a-41bd-e414-f6ad-e58d267f4e95':
          'Strong vertical mobility advantages on Port'
      }
    }

    if (mapSpecificStrengths[mapId]?.[agentId]) {
      reasons.push({
        text: mapSpecificStrengths[mapId][agentId],
        weight: 0.8
      })
    }

    return reasons
  }

  return {
    topPerformers,
    recommendations: recommendations.map((rec) => ({
      ...rec,
      reasons: rec.reasons.map((reason) => reason.text)
    })),
    getAgentRecommendationForMap: (mapId: string) =>
      recommendations
        .filter(
          (rec) =>
            generateReasons(
              rec.agentId,
              mapId,
              topPerformers
            ).length > 0
        )
        .map((rec) => ({
          ...rec,
          reasons: rec.reasons.map((reason) => reason.text)
        }))
  }
}

export default useAgentAnalytics
