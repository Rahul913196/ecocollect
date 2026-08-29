import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../api/axios.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadCurrentUser = useCallback(async () => {
    const token = localStorage.getItem('ecocollect_token')
    if (!token) {
      setLoading(false)
      return
    }
    try {
      const res = await api.get('/auth/me')
      setUser(res.data)
    } catch {
      localStorage.removeItem('ecocollect_token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCurrentUser()
  }, [loadCurrentUser])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    localStorage.setItem('ecocollect_token', res.data.access_token)
    setUser(res.data.user)
    return res.data.user
  }

  const register = async (payload) => {
    const res = await api.post('/auth/register', payload)
    localStorage.setItem('ecocollect_token', res.data.access_token)
    setUser(res.data.user)
    return res.data.user
  }

  const logout = () => {
    localStorage.removeItem('ecocollect_token')
    setUser(null)
  }

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask not found. Install the MetaMask extension to connect a wallet.')
    }
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    const address = accounts[0]
    if (!address) throw new Error('No wallet account returned.')

    const message = `Link this wallet to my EcoCollect account (${user?.email ?? ''}) — ${Date.now()}`
    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [message, address],
    })

    const res = await api.post('/auth/wallet', { address, message, signature })
    setUser(res.data)
    return res.data
  }

  const disconnectWallet = async () => {
    const res = await api.delete('/auth/wallet')
    setUser(res.data)
    return res.data
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout, connectWallet, disconnectWallet }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
