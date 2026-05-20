import React from 'react'
import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 selection:bg-indigo-500/30 selection:text-indigo-200 relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none"></div>
      
      <div className="text-center z-10 max-w-sm flex flex-col items-center">
        <h1 className="text-8xl font-extrabold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">404</h1>
        <h2 className="text-xl font-bold text-white mb-2">Lost in the grid?</h2>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          The page you are looking for doesn't exist or has been shifted to another namespace.
        </p>
        <Link
          to="/"
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-indigo-600/15 active:scale-95 transition-all"
        >
          Return Workspace
        </Link>
      </div>
    </div>
  )
}

export default NotFound
