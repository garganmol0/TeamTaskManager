import React from 'react'
import { Link } from 'react-router-dom'
function Home(){
  return React.createElement('div', { className: 'min-h-screen flex items-center justify-center bg-gray-50' },
    React.createElement('div', { className: 'max-w-2xl p-8 bg-white rounded shadow' },
      React.createElement('h1', { className: 'text-2xl font-bold mb-4' }, 'Team Task Manager'),
      React.createElement('p', { className: 'mb-4' }, 'Collaborative project and task management for teams.'),
      React.createElement('div', { className: 'flex gap-4' },
        React.createElement(Link, { to: '/signup', className: 'px-4 py-2 bg-blue-600 text-white rounded' }, 'Get Started'),
        React.createElement(Link, { to: '/login', className: 'px-4 py-2 border rounded' }, 'Login')
      )
    )
  )
}
export default Home
