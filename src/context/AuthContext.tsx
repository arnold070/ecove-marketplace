'use client'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'

interface VendorInfo {
  id: string; businessName: string; slug: string
  status: string; availableBalance: number; averageRating: number
}
interface User {
  id: string; firstName: string; lastName: string
  email: string; role: string; avatarUrl?: string
  vendor?: VendorInfo
}
interface AuthCtx {
  user:    User | null
  loading: boolean
  login:   (email: string, password: string) => Promise<void>
  logout:  () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthCtx>({} as AuthCtx)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const refresh = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/auth/me')
      setUser(data.data)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const login = async (email: string, password: string) => {
    const { data } = await axios.post('/api/auth/login', { email, password })
    setUser(data.data.user)
    const role = data.data.user.role
    if (role === 'super_admin' || role === 'admin') router.push('/admin')
    else if (role === 'vendor') router.push('/vendor/dashboard')
    else router.push('/')
  }

  const logout = async () => {
    await axios.post('/api/auth/logout')
    setUser(null)
    router.push('/')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
