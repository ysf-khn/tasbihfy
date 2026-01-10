export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      User: {
        Row: {
          id: string
          name: string
          email: string
          emailVerified: boolean
          image: string | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id: string
          name: string
          email: string
          emailVerified?: boolean
          image?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          emailVerified?: boolean
          image?: string | null
          createdAt?: string
          updatedAt?: string
        }
      }
      Account: {
        Row: {
          id: string
          accountId: string
          providerId: string
          userId: string
          password: string | null
          createdAt: string
          updatedAt: string
          accessToken: string | null
          accessTokenExpiresAt: string | null
          idToken: string | null
          refreshToken: string | null
          refreshTokenExpiresAt: string | null
          scope: string | null
        }
        Insert: {
          id: string
          accountId: string
          providerId: string
          userId: string
          password?: string | null
          createdAt?: string
          updatedAt?: string
          accessToken?: string | null
          accessTokenExpiresAt?: string | null
          idToken?: string | null
          refreshToken?: string | null
          refreshTokenExpiresAt?: string | null
          scope?: string | null
        }
        Update: {
          id?: string
          accountId?: string
          providerId?: string
          userId?: string
          password?: string | null
          createdAt?: string
          updatedAt?: string
          accessToken?: string | null
          accessTokenExpiresAt?: string | null
          idToken?: string | null
          refreshToken?: string | null
          refreshTokenExpiresAt?: string | null
          scope?: string | null
        }
      }
      Session: {
        Row: {
          id: string
          userId: string
          token: string
          expiresAt: string
          ipAddress: string | null
          userAgent: string | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id: string
          userId: string
          token: string
          expiresAt: string
          ipAddress?: string | null
          userAgent?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          userId?: string
          token?: string
          expiresAt?: string
          ipAddress?: string | null
          userAgent?: string | null
          createdAt?: string
          updatedAt?: string
        }
      }
      verification: {
        Row: {
          id: string
          identifier: string
          value: string
          expiresAt: string
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id: string
          identifier: string
          value: string
          expiresAt: string
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          identifier?: string
          value?: string
          expiresAt?: string
          createdAt?: string
          updatedAt?: string
        }
      }
      Dhikr: {
        Row: {
          id: string
          userId: string
          name: string
          targetCount: number
          isFavorite: boolean
          createdAt: string
          updatedAt: string
          arabicText: string | null
          transliteration: string | null
        }
        Insert: {
          id: string
          userId: string
          name: string
          targetCount: number
          isFavorite?: boolean
          createdAt?: string
          updatedAt?: string
          arabicText?: string | null
          transliteration?: string | null
        }
        Update: {
          id?: string
          userId?: string
          name?: string
          targetCount?: number
          isFavorite?: boolean
          createdAt?: string
          updatedAt?: string
          arabicText?: string | null
          transliteration?: string | null
        }
      }
      DhikrSession: {
        Row: {
          id: string
          dhikrId: string
          userId: string
          currentCount: number
          completed: boolean
          startedAt: string
          completedAt: string | null
          updatedAt: string
        }
        Insert: {
          id: string
          dhikrId: string
          userId: string
          currentCount?: number
          completed?: boolean
          startedAt?: string
          completedAt?: string | null
          updatedAt?: string
        }
        Update: {
          id?: string
          dhikrId?: string
          userId?: string
          currentCount?: number
          completed?: boolean
          startedAt?: string
          completedAt?: string | null
          updatedAt?: string
        }
      }
      DailyProgress: {
        Row: {
          id: string
          userId: string
          dhikrId: string
          date: string
          targetCount: number
          currentCount: number
          completed: boolean
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id: string
          userId: string
          dhikrId: string
          date: string
          targetCount: number
          currentCount?: number
          completed?: boolean
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          userId?: string
          dhikrId?: string
          date?: string
          targetCount?: number
          currentCount?: number
          completed?: boolean
          createdAt?: string
          updatedAt?: string
        }
      }
      PrayerLocation: {
        Row: {
          id: string
          userId: string
          name: string
          latitude: string
          longitude: string
          timezone: string | null
          country: string | null
          countryCode: string | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id: string
          userId: string
          name: string
          latitude: string
          longitude: string
          timezone?: string | null
          country?: string | null
          countryCode?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          userId?: string
          name?: string
          latitude?: string
          longitude?: string
          timezone?: string | null
          country?: string | null
          countryCode?: string | null
          createdAt?: string
          updatedAt?: string
        }
      }
      PrayerTimeCache: {
        Row: {
          id: string
          locationQuery: string
          date: string
          fajr: string
          shurooq: string
          dhuhr: string
          asr: string
          maghrib: string
          isha: string
          qiblaDirection: string | null
          latitude: string | null
          longitude: string | null
          timezone: string | null
          country: string | null
          countryCode: string | null
          temperature: string | null
          pressure: string | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id: string
          locationQuery: string
          date: string
          fajr: string
          shurooq: string
          dhuhr: string
          asr: string
          maghrib: string
          isha: string
          qiblaDirection?: string | null
          latitude?: string | null
          longitude?: string | null
          timezone?: string | null
          country?: string | null
          countryCode?: string | null
          temperature?: string | null
          pressure?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          locationQuery?: string
          date?: string
          fajr?: string
          shurooq?: string
          dhuhr?: string
          asr?: string
          maghrib?: string
          isha?: string
          qiblaDirection?: string | null
          latitude?: string | null
          longitude?: string | null
          timezone?: string | null
          country?: string | null
          countryCode?: string | null
          temperature?: string | null
          pressure?: string | null
          createdAt?: string
          updatedAt?: string
        }
      }
      ReminderPreferences: {
        Row: {
          id: string
          userId: string
          reminderEnabled: boolean
          reminderTime: string
          timezone: string
          pushSubscription: Json | null
          lastReminderSent: string | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id: string
          userId: string
          reminderEnabled?: boolean
          reminderTime?: string
          timezone?: string
          pushSubscription?: Json | null
          lastReminderSent?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          userId?: string
          reminderEnabled?: boolean
          reminderTime?: string
          timezone?: string
          pushSubscription?: Json | null
          lastReminderSent?: string | null
          createdAt?: string
          updatedAt?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
