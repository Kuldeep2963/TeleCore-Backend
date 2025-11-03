import { StrictMode } from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

const root = document.getElementById('root')
if (!root) {
  document.body.innerHTML = '<h1>Error: Root element not found</h1>'
} else {
  try {
    createRoot(root).render(
      <StrictMode>
        <ChakraProvider>
          <App />
        </ChakraProvider>
      </StrictMode>
    )
  } catch (error) {
    console.error('App render error:', error)
    root.innerHTML = `<h1>Error: ${error.message}</h1><pre>${error.stack}</pre>`
  }
}