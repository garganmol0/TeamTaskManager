import React, { useContext } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import NotFound from './pages/NotFound'
import { AuthProvider, AuthContext } from './contexts/AuthContext'

function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext)
  if (loading) {
    return React.createElement('div', { className: 'min-h-screen flex items-center justify-center bg-slate-950 text-slate-200 font-semibold' }, 'Loading...')
  }
  if (!user) {
    return React.createElement(Navigate, { to: '/login', replace: true })
  }
  return children
}

function GuestRoute({ children }) {
  const { user, loading } = useContext(AuthContext)
  if (loading) {
    return React.createElement('div', { className: 'min-h-screen flex items-center justify-center bg-slate-950 text-slate-200 font-semibold' }, 'Loading...')
  }
  if (user) {
    return React.createElement(Navigate, { to: '/dashboard', replace: true })
  }
  return children
}

function App(){
  return React.createElement(AuthProvider, null, React.createElement(Routes, null,
    React.createElement(Route, { path: '/', element: React.createElement(GuestRoute, null, React.createElement(Home)) }),
    React.createElement(Route, { path: '/login', element: React.createElement(GuestRoute, null, React.createElement(Login)) }),
    React.createElement(Route, { path: '/signup', element: React.createElement(GuestRoute, null, React.createElement(Signup)) }),
    React.createElement(Route, { path: '/dashboard', element: React.createElement(ProtectedRoute, null, React.createElement(Dashboard)) }),
    React.createElement(Route, { path: '*', element: React.createElement(NotFound) })
  ))
}
export default App
