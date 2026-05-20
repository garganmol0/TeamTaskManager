import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import axios from 'axios'
function Dashboard(){
  const { user, logout } = useContext(AuthContext)
  const [projects, setProjects] = useState([])
  const [activities, setActivities] = useState([])
  useEffect(() => {
    const token = localStorage.getItem('token')
    axios.get(import.meta.env.VITE_API_URL + '/api/projects', { headers: { Authorization: `Bearer ${token}` } }).then(res => setProjects(res.data))
    axios.get(import.meta.env.VITE_API_URL + '/api/activity', { headers: { Authorization: `Bearer ${token}` } }).then(res => setActivities(res.data))
  }, [])
  return React.createElement('div', { className: 'min-h-screen p-6 bg-gray-100' },
    React.createElement('div', { className: 'max-w-6xl mx-auto' },
      React.createElement('div', { className: 'flex justify-between items-center mb-6' },
        React.createElement('h1', { className: 'text-2xl font-bold' }, `Welcome, ${user ? user.name : ''}`),
        React.createElement('button', { onClick: logout, className: 'px-3 py-1 border rounded' }, 'Logout')
      ),
      React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-4' },
        React.createElement('div', { className: 'col-span-2' },
          React.createElement('div', { className: 'mb-4 p-4 bg-white rounded shadow' },
            React.createElement('h2', { className: 'font-semibold mb-2' }, 'Projects'),
            projects.map(p => React.createElement('div', { key: p._id, className: 'p-2 border rounded mb-2' },
              React.createElement('h3', { className: 'font-medium' }, p.title),
              React.createElement('p', { className: 'text-sm text-gray-600' }, p.description)
            ))
          ),
          React.createElement('div', { className: 'p-4 bg-white rounded shadow' },
            React.createElement('h2', { className: 'font-semibold mb-2' }, 'Activity'),
            activities.map(a => React.createElement('div', { key: a._id, className: 'p-2 border rounded mb-2' },
              React.createElement('p', { className: 'text-sm text-gray-700' }, a.message),
              React.createElement('p', { className: 'text-xs text-gray-500' }, new Date(a.createdAt).toLocaleString())
            ))
          )
        ),
        React.createElement('div', null,
          React.createElement('div', { className: 'p-4 bg-white rounded shadow mb-4' },
            React.createElement('h2', { className: 'font-semibold' }, 'Stats'),
            React.createElement('p', null, 'Total projects: ', projects.length)
          ),
          React.createElement('div', { className: 'p-4 bg-white rounded shadow' },
            React.createElement('h2', { className: 'font-semibold' }, 'Quick Actions')
          )
        )
      )
    )
  )
}
export default Dashboard
