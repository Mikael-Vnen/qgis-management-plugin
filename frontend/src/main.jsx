import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './ErrorBoundary.jsx'


function showRuntimeError(label, error) {
  const panel = document.getElementById('runtime-error')
  panel.textContent = `${label}\n${error?.stack || String(error)}`
  panel.hidden = false
}

window.addEventListener('error', (event) => {
  showRuntimeError('Unexpected JavaScript error', event.error ?? event.message)
})

window.addEventListener('unhandledrejection', (event) => {
  showRuntimeError('Unhandled Promise rejection', event.reason)
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
)
