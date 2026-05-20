import React from 'react'
import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Decorative background glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Header */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2.5">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">TaskForge</span>
        </div>
        <Link 
          to="/login" 
          className="text-sm font-semibold text-slate-300 hover:text-white px-4 py-2 hover:bg-slate-900 border border-transparent hover:border-slate-800 rounded-lg transition-all"
        >
          Sign In
        </Link>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto w-full px-6 text-center my-auto flex flex-col items-center gap-8 z-10 py-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold rounded-full uppercase tracking-wider">
          🚀 Next-gen task management
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Unite your team.<br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Accelerate your projects.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-xl leading-relaxed">
          Create projects, delegate tasks, and visualize progress in real-time. Built for high-velocity teams who demand clarity and execution.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-2">
          <Link
            to="/signup"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-sm shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
          >
            Get Started Free
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-lg font-bold text-sm active:scale-95 transition-all"
          >
            Request Demo
          </Link>
        </div>

        {/* Feature Preview Card */}
        <div className="mt-12 w-full max-w-2xl bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm shadow-2xl relative">
          <div className="flex gap-1.5 border-b border-slate-800 pb-4 mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-left">
            <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-850">
              <span className="text-xs font-bold text-slate-500 uppercase">To Do</span>
              <div className="h-2 bg-indigo-500/20 rounded mt-3 w-3/4"></div>
              <div className="h-2 bg-slate-850 rounded mt-2 w-1/2"></div>
            </div>
            <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-850">
              <span className="text-xs font-bold text-slate-500 uppercase">In Progress</span>
              <div className="h-2 bg-indigo-500/40 rounded mt-3 w-5/6"></div>
              <div className="h-2 bg-slate-850 rounded mt-2 w-2/3"></div>
            </div>
            <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-850">
              <span className="text-xs font-bold text-slate-500 uppercase">Done</span>
              <div className="h-2 bg-emerald-500/40 rounded mt-3 w-full animate-pulse"></div>
              <div className="h-2 bg-slate-850 rounded mt-2 w-3/4"></div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-slate-600 z-10 border-t border-slate-900/60 max-w-7xl mx-auto w-full">
        &copy; {new Date().getFullYear()} TaskForge. All rights reserved.
      </footer>
    </div>
  )
}

export default Home
