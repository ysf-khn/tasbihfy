"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { useSession } from '@/lib/auth-client'
import type { User, Session } from '@/lib/auth'
import { LocalStorageCleanup } from '@/lib/localStorage-cleanup'

interface AuthContextType {
  user: User | null
  session: Session | null
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending: isLoading } = useSession()
  const [previousUserId, setPreviousUserId] = useState<string | null>(null)

  // Handle localStorage cleanup when user changes
  useEffect(() => {
    const currentUserId = session?.user?.id || null
    
    // If user logged out, clean up their session data
    if (previousUserId && !currentUserId) {
      console.log('User logged out, cleaning up localStorage...')
      LocalStorageCleanup.cleanupDhikrSessions(previousUserId)
    }
    
    // If user changed, clean up previous user's data
    if (previousUserId && currentUserId && previousUserId !== currentUserId) {
      console.log('User changed, cleaning up previous user localStorage...')
      LocalStorageCleanup.cleanupDhikrSessions(previousUserId)
    }
    
    // Run general cleanup periodically when user changes
    if (currentUserId !== previousUserId) {
      LocalStorageCleanup.runFullCleanup()
    }
    
    setPreviousUserId(currentUserId)
  }, [session?.user?.id, previousUserId])

  return (
    <AuthContext.Provider
      value={{
        user: session?.user || null,
        session: session?.session || null,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}