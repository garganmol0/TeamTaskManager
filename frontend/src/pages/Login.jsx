import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()
  const submit = async (e) => {
    e.preventDefault()
    await login(email, password)
    navigate('/dashboard')
  }
  return React.createElement('div', { className: 'min-h-screen flex items-center justify-center bg-gray-50' },
    React.createElement('form', { onSubmit: submit, className: 'w-full max-w-md p-8 bg-white rounded shadow' },
      React.createElement('h2', { className: 'text-xl font-bold mb-4' }, 'Login'),
      React.createElement('input', { type: 'email', placeholder: 'Email', value: email, onChange: e => setEmail(e.target.value), className: 'w-full p-2 border mb-3 rounded' }),
      React.createElement('input', { type: 'password', placeholder: 'Password', value: password, onChange: e => setPassword(e.target.value), className: 'w-full p-2 border mb-3 rounded' }),
      React.createElement('button', { type: 'submit', className: 'w-full p-2 bg-blue-600 text-white rounded' }, 'Login')
    )
  )
}
export default Login
