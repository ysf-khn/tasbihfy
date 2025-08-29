"use client"

import { useState } from 'react'
import Link from 'next/link'
import type { Dhikr, DhikrSession } from '@prisma/client'
import { 
  EllipsisVerticalIcon, 
  PencilIcon, 
  TrashIcon,
  CheckCircleIcon,
  StarIcon,
  PlayIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

interface DhikrWithSession extends Dhikr {
  sessions: DhikrSession[]
}

interface DhikrCardProps {
  dhikr: DhikrWithSession
  onEdit: (dhikr: Dhikr) => void
  onDelete: (id: string) => void
}

export default function DhikrCard({ dhikr, onEdit, onDelete }: DhikrCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  
  const currentSession = dhikr.sessions[0]
  const currentCount = currentSession?.currentCount || 0
  const progress = dhikr.targetCount > 0 ? (currentCount / dhikr.targetCount) * 100 : 0
  const isComplete = currentCount >= dhikr.targetCount
  const progressPercentage = Math.min(progress, 100)
  
  // Check for milestones
  const hasMilestone = progressPercentage >= 25 && progressPercentage < 100

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${dhikr.name}"? This will remove all associated counting sessions.`)) {
      setIsDeleting(true)
      try {
        await onDelete(dhikr.id)
      } finally {
        setIsDeleting(false)
      }
    }
  }

  return (
    <div className={`card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 border-2 ${
      isComplete ? 'border-success' : hasMilestone ? 'border-warning' : 'border-transparent'
    }`}>
      <div className="card-body">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <h3 className="card-title text-lg">{dhikr.name}</h3>
            {isComplete && <CheckCircleIcon className="w-5 h-5 text-success" />}
            {hasMilestone && !isComplete && <StarIcon className="w-5 h-5 text-warning" />}
          </div>
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-sm btn-square hover:btn-primary transition-colors">
              <EllipsisVerticalIcon className="w-4 h-4" />
            </div>
            <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-40 p-2 shadow-xl border">
              <li>
                <button onClick={() => onEdit(dhikr)} className="flex items-center gap-2">
                  <PencilIcon className="w-4 h-4" />
                  Edit
                </button>
              </li>
              <li>
                <button 
                  onClick={handleDelete} 
                  className="text-error flex items-center gap-2"
                  disabled={isDeleting}
                >
                  <TrashIcon className="w-4 h-4" />
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="space-y-4">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-1">
                <ClockIcon className="w-4 h-4" />
                Progress
              </span>
              <span className={`font-semibold ${isComplete ? 'text-success' : 'text-primary'}`}>
                {currentCount} of {dhikr.targetCount}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <progress 
                className={`progress flex-1 ${isComplete ? 'progress-success' : 'progress-primary'}`} 
                value={progressPercentage} 
                max="100"
              ></progress>
              <span className="text-xs text-base-content/60 min-w-fit">
                {Math.round(progressPercentage)}%
              </span>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex gap-2 flex-wrap">
            {isComplete && (
              <div className="badge badge-success gap-1 animate-pulse">
                <CheckCircleIcon className="w-3 h-3" />
                Completed
              </div>
            )}
            {hasMilestone && !isComplete && (
              <div className="badge badge-warning gap-1">
                <StarIcon className="w-3 h-3" />
                {progressPercentage >= 75 ? '75%' : progressPercentage >= 50 ? '50%' : '25%'} Milestone
              </div>
            )}
          </div>

          {/* Last activity */}
          {currentSession && (
            <p className="text-xs text-base-content/60 flex items-center gap-1">
              <ClockIcon className="w-3 h-3" />
              Last activity: {new Date(currentSession.updatedAt).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="card-actions justify-end mt-6">
          <Link 
            href={`/?dhikr=${dhikr.id}`}
            className={`btn btn-sm shadow-lg hover:shadow-xl transition-all duration-200 ${
              isComplete ? 'btn-success' : 'btn-primary'
            }`}
          >
            <PlayIcon className="w-4 h-4" />
            {isComplete ? 'Count Again' : 'Start Counting'}
          </Link>
        </div>
      </div>
    </div>
  )
}