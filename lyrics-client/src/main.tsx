import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom"

import App from '@/App.tsx'

// Import stylesheets
import '@/styles/tailwind.css'
import '@/styles/custom.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>  
      <App />
    </BrowserRouter>
  </StrictMode>,
)
