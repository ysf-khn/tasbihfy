"use client"

import { AuthProvider } from '@/components/auth/AuthProvider'
import { ArabicSettingsProvider } from '@/contexts/ArabicSettingsContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ArabicSettingsProvider>
        {children}
      </ArabicSettingsProvider>
    </AuthProvider>
  )
}