// main.jsx ou index.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'  // ← VERIFIQUE SE ESTÁ AQUI
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)