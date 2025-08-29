"use client"

import { useState, useEffect } from 'react'
import type { Dhikr } from '@prisma/client'

interface CreateDhikrModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { name: string; targetCount: number }) => Promise<void>
  initialData?: Dhikr
  title: string
}

const commonDhikrs = [
  { name: 'SubhanAllah', targetCount: 33 },
  { name: 'Alhamdulillah', targetCount: 33 },
  { name: 'Allahu Akbar', targetCount: 34 },
  { name: 'La ilaha illa Allah', targetCount: 100 },
  { name: 'Astaghfirullah', targetCount: 100 },
  { name: 'SubhanAllahi wa bihamdihi', targetCount: 100 },
]

export default function CreateDhikrModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData,
  title 
}: CreateDhikrModalProps) {
  const [name, setName] = useState('')
  const [targetCount, setTargetCount] = useState(100)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (initialData) {
      setName(initialData.name)
      setTargetCount(initialData.targetCount)
    } else {
      setName('')
      setTargetCount(100)
    }
    setError('')
  }, [initialData, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await onSubmit({ name: name.trim(), targetCount })
      setName('')
      setTargetCount(100)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickSelect = (dhikr: { name: string; targetCount: number }) => {
    setName(dhikr.name)
    setTargetCount(dhikr.targetCount)
  }

  const handleClose = () => {
    if (!isLoading) {
      onClose()
      setError('')
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-md">
        <h3 className="font-bold text-lg mb-4">{title}</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Dhikr Name</span>
            </label>
            <input
              type="text"
              placeholder="Enter dhikr name"
              className="input input-bordered w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
            />
          </div>

          {!initialData && (
            <div className="space-y-2">
              <label className="label">
                <span className="label-text">Quick Select</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {commonDhikrs.map((dhikr, index) => (
                  <button
                    key={index}
                    type="button"
                    className="btn btn-outline btn-sm text-xs"
                    onClick={() => handleQuickSelect(dhikr)}
                  >
                    {dhikr.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="form-control">
            <label className="label">
              <span className="label-text">Target Count</span>
            </label>
            <input
              type="number"
              placeholder="Enter target count"
              className="input input-bordered w-full"
              value={targetCount}
              onChange={(e) => setTargetCount(parseInt(e.target.value) || 1)}
              required
              min={1}
              max={10000}
            />
          </div>

          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}

          <div className="modal-action">
            <button
              type="button"
              className="btn"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
              disabled={isLoading || !name.trim()}
            >
              {isLoading ? 'Saving...' : initialData ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={handleClose}></div>
    </div>
  )
}