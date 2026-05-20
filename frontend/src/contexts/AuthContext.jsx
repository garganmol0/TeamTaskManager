import React, { createContext, useState, useEffect } from 'react'
import axios from 'axios'
export const AuthContext = createContext()
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    if (token && userStr) setUser(JSON.parse(userStr))
    setLoading(false)
  }, [])
  const login = async (email, password) => {
    const res = await axios.post(import.meta.env.VITE_API_URL + '/api/auth/login', { email, password })
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('user', JSON.stringify(res.data.user))
    setUser(res.data.user)
  }
  const signup = async (name, email, password) => {
    const res = await axios.post(import.meta.env.VITE_API_URL + '/api/auth/signup', { name, email, password })
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('user', JSON.stringify(res.data.user))
    setUser(res.data.user)
  }
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }
  return React.createElement(AuthContext.Provider, { value: { user, loading, login, signup, logout } }, children)
}
