"use client"

import { useEffect, useState } from 'react'
import { SparklesIcon, StarIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { getMilestoneMessage, getRandomMessage, encouragements } from '@/lib/messages'

interface MilestoneProps {
  percentage: number
  isComplete?: boolean
  onDismiss?: () => void
}

export default function Milestone({ percentage, isComplete = false, onDismiss }: MilestoneProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (isComplete) {
      setMessage(getRandomMessage(encouragements.completion))
    } else {
      setMessage(getMilestoneMessage(percentage))
    }
    
    setIsVisible(true)
    
    // Auto-dismiss after 4 seconds
    const timer = setTimeout(() => {
      handleDismiss()
    }, 4000)

    return () => clearTimeout(timer)
  }, [percentage, isComplete])

  const handleDismiss = () => {
    setIsVisible(false)
    setTimeout(() => {
      onDismiss?.()
    }, 300) // Wait for animation to complete
  }

  const getIcon = () => {
    if (isComplete) {
      return <CheckCircleIcon className="w-8 h-8" />
    }
    if (percentage >= 75) {
      return <SparklesIcon className="w-8 h-8" />
    }
    return <StarIcon className="w-8 h-8" />
  }

  const getAlertClass = () => {
    if (isComplete) return 'alert-success'
    if (percentage >= 75) return 'alert-info'
    if (percentage >= 50) return 'alert-warning'
    return 'alert-info'
  }

  const getMilestoneText = () => {
    if (isComplete) return 'Completed!'
    if (percentage >= 75) return '75% Milestone!'
    if (percentage >= 50) return '50% Milestone!'
    return '25% Milestone!'
  }

  if (!isVisible) return null

  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
      isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
    }`}>
      <div className={`alert ${getAlertClass()} shadow-2xl max-w-sm animate-bounce`}>
        <div className="flex items-center gap-3">
          {getIcon()}
          <div className="flex-1">
            <div className="font-bold text-lg">{getMilestoneText()}</div>
            <div className="text-sm opacity-90">{message}</div>
          </div>
          <button 
            onClick={handleDismiss}
            className="btn btn-ghost btn-sm btn-circle hover:bg-base-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

// Hook to manage milestone notifications
export function useMilestoneNotifications() {
  const [activeMilestone, setActiveMilestone] = useState<{
    percentage: number
    isComplete: boolean
  } | null>(null)

  const showMilestone = (percentage: number, isComplete = false) => {
    setActiveMilestone({ percentage, isComplete })
  }

  const hideMilestone = () => {
    setActiveMilestone(null)
  }

  return {
    activeMilestone,
    showMilestone,
    hideMilestone
  }
}