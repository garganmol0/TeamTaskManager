import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import NotFound from './pages/NotFound'
import { AuthProvider } from './contexts/AuthContext'
function App(){
  return React.createElement(AuthProvider, null, React.createElement(Routes, null,
    React.createElement(Route, { path: '/', element: React.createElement(Home) }),
    React.createElement(Route, { path: '/login', element: React.createElement(Login) }),
    React.createElement(Route, { path: '/signup', element: React.createElement(Signup) }),
    React.createElement(Route, { path: '/dashboard', element: React.createElement(Dashboard) }),
    React.createElement(Route, { path: '*', element: React.createElement(NotFound) })
  ))
}
export default App
