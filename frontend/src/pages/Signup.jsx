import React, { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'

function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signup } = useContext(AuthContext)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signup(name, email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating account. Ensure password is at least 6 characters.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 selection:bg-indigo-500/30 selection:text-indigo-200 relative">
      <div className="absolute top-1/4 right-1/3 w-72 h-72 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800/90 p-8 rounded-2xl shadow-2xl z-10">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-650/20">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Create an account</h2>
          <p className="text-xs text-slate-400 font-medium">Join TaskForge to collaborate on tasks and projects</p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold p-3.5 rounded-xl mb-5 flex items-start gap-2.5 leading-relaxed">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400">Full Name</label>
            <input 
              placeholder="John Doe" 
              required
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="bg-slate-950 border border-slate-800 text-sm text-slate-200 p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all" 
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400">Email Address</label>
            <input 
              type="email" 
              required
              placeholder="name@company.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="bg-slate-950 border border-slate-800 text-sm text-slate-200 p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all" 
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400">Password</label>
            <input 
              type="password" 
              required
              placeholder="••••••••" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="bg-slate-950 border border-slate-800 text-sm text-slate-200 p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all" 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700/60 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm shadow-xl shadow-indigo-650/10 active:scale-[0.98] transition-all flex justify-center items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating account...</span>
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Signup
