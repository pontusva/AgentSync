import { motion } from 'framer-motion'
import { CheckCircle } from 'lucide-react'
import { Recommendation } from '../../utils/mockData'
import useAgentAnalytics, {
  AGENT_ROLES
} from '@/data/useAgentAnalytics'
import matchData from '@/data/response.json'

interface RecommendationsProps {
  recommendations: Recommendation[]
}

export default function Recommendations() {
  const { recommendations } = useAgentAnalytics(matchData)

  return (
    <div className="space-y-6">
      {recommendations.map((recommendation) => (
        <motion.div
          key={recommendation.agentId}
          className="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-blue-500"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}>
          <div className="p-6">
            <div className="flex justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                {AGENT_ROLES[recommendation.agentId]} Agent
                Recommendation
              </h3>
              <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                {recommendation.confidence.toFixed(0)}%
                Confidence
              </span>
            </div>
            <h4 className="text-lg text-left font-medium text-gray-800 mb-2">
              Reasons:
            </h4>
            <ul className="space-y-2">
              {recommendation.reasons.map(
                (reason, index) => (
                  <li
                    key={index}
                    className="flex items-start">
                    <CheckCircle
                      className="text-green-500 mr-2 mt-1 flex-shrink-0"
                      size={18}
                    />
                    <span className="text-gray-700">
                      {reason}
                    </span>
                  </li>
                )
              )}
            </ul>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
