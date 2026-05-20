import React from 'react'
function NotFound(){
  return React.createElement('div', { className: 'min-h-screen flex items-center justify-center' },
    React.createElement('div', { className: 'text-center' },
      React.createElement('h1', { className: 'text-4xl font-bold mb-2' }, '404'),
      React.createElement('p', { className: 'text-lg' }, 'Page not found')
    )
  )
}
export default NotFound
