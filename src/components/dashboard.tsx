import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import TopPerformers from '@/components/TopPerformers'
import Recommendations from '@/components/Recommendations'
import {
  generatePlayers,
  generateRecommendations,
  Player,
  Recommendation
} from '../../utils/mockData'

export default function Dashboard() {
  const [players, setPlayers] = useState<Player[]>([])
  const [recommendations, setRecommendations] = useState<
    Recommendation[]
  >([])

  useEffect(() => {
    setPlayers(generatePlayers(8))
    setRecommendations(generateRecommendations(5))
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <motion.h1
          className="text-3xl font-bold text-gray-900 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}>
          AgentSync
        </motion.h1>

        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            SAMPLE DATA
          </h2>
          <TopPerformers players={players} />
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Recommendations
          </h2>
          <Recommendations
            recommendations={recommendations}
          />
        </div>
      </div>
    </div>
  )
}
