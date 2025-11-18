// src/main.tsx (修正後)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'; // 👈 引入 BrowserRouter
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* 👈 將整個 App 包裹在 BrowserRouter 內 */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)