'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type User = {
  id: number
  email: string
}

const TOKEN_KEY = 'taskflow_jwt_token'

export function useJWTSession() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const storedToken = sessionStorage.getItem(TOKEN_KEY)
    
    if (storedToken) {
      try {
        const payload = JSON.parse(atob(storedToken.split('.')[1]))
        
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          sessionStorage.removeItem(TOKEN_KEY)
          setLoading(false)
          return
        }
        
        setUser({ id: payload.userId, email: payload.email })
        setToken(storedToken)
      } catch (error) {
        console.error('Error loading token:', error)
        sessionStorage.removeItem(TOKEN_KEY)
      }
    }
    
    setLoading(false)
  }, [])

  const login = (jwtToken: string, userData: User) => {
    console.log('Login function called with:', { jwtToken, userData })
    
    // Store token in sessionStorage
    sessionStorage.setItem(TOKEN_KEY, jwtToken)
    console.log('Token stored in sessionStorage')
    
    // Update state
    setToken(jwtToken)
    setUser(userData)
    
    // Verify it was stored
    const verify = sessionStorage.getItem(TOKEN_KEY)
    console.log('Verification - token exists:', !!verify)
  }

  const logout = () => {
    sessionStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
    router.push('/login')
  }

  const checkProtected = () => {
    if (!loading && !user) {
      router.push('/login')
    }
  }

  useEffect(() => {
    const handleBeforeUnload = () => {}
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  useEffect(() => {
    if (!token) return

    const checkExpiry = () => {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          logout()
        }
      } catch (error) {}
    }

    const interval = setInterval(checkExpiry, 60000)
    return () => clearInterval(interval)
  }, [token])

  return { 
    user, 
    token,
    loading, 
    login, 
    logout, 
    checkProtected,
    isAuthenticated: !!user 
  }
}
