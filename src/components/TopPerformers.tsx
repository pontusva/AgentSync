import { motion } from 'framer-motion'
import useAgentAnalytics from '@/data/useAgentAnalytics'
import matchData from '@/data/response.json'
import { faker } from '@faker-js/faker'

interface TopPerformersProps {
  players: PlayerPerformance[]
}

export default function TopPerformers() {
  const { topPerformers } = useAgentAnalytics(matchData)

  // Generate a stable avatar URL for each player
  const getPlayerAvatar = (puuid: string) => {
    // Seed the faker with puuid to get consistent avatars for same players
    faker.seed(puuid.split('-')[0].length)
    return faker.image.avatar()
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {topPerformers.map((player) => (
        <motion.div
          key={player.puuid}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}>
          <div className="p-6">
            <div className="flex items-center mb-4">
              <img
                src={getPlayerAvatar(player.puuid)}
                alt={player.name}
                width={64}
                height={64}
                className="rounded-full mr-4"
              />
              <h3 className="text-xl font-semibold text-gray-800">
                {player.name}
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">
                  Kills
                </p>
                <p className="text-lg font-medium text-gray-800">
                  {player.kills}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">
                  Deaths
                </p>
                <p className="text-lg font-medium text-gray-800">
                  {player.deaths}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">
                  Assists
                </p>
                <p className="text-lg font-medium text-gray-800">
                  {player.assists}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">
                  Score
                </p>
                <p className="text-lg font-medium text-blue-600">
                  {player.score}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">KDA</p>
                <p className="text-lg font-medium text-gray-800">
                  {(
                    (player.kills + player.assists) /
                    Math.max(1, player.deaths)
                  ).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">
                  Utility Usage
                </p>
                <p className="text-lg font-medium text-gray-800">
                  {Object.values(
                    player.utilityUsage
                  ).reduce((sum, casts) => sum + casts, 0)}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
