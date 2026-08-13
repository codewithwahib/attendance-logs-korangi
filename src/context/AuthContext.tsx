'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'
import { useRouter } from 'next/navigation'

type UserRole = 'hr'

interface User {
  username: string
  role: UserRole
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('hrms_user')

      if (savedUser) {
        const parsedUser = JSON.parse(savedUser)

        if (parsedUser && parsedUser.username && parsedUser.role === 'hr') {
          setUser({
            username: parsedUser.username,
            role: 'hr',
          })
        } else {
          localStorage.removeItem('hrms_user')
        }
      }
    } catch (error) {
      console.error('Restore auth error:', error)
      localStorage.removeItem('hrms_user')
    } finally {
      setLoading(false)
    }
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        return false
      }

      const loggedInUser: User = {
        username: data.username,
        role: 'hr',
      }

      localStorage.setItem('hrms_user', JSON.stringify(loggedInUser))
      setUser(loggedInUser)
      
      return true
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('hrms_user')
    setUser(null)
    
    // Call logout API to clear any cookies
    fetch('/api/auth/logout', { method: 'POST' }).catch(console.error)
    
    router.push('/login')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}