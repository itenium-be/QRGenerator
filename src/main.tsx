import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { resolveSmartLink } from './state/smartlink'
import App from './ui/App'
import './index.css'

const target = resolveSmartLink(location.hash, navigator.userAgent)
if (target) location.replace(target)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
