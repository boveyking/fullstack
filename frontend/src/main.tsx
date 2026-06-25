import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { AuthProvider } from './contexts/AuthContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MantineProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MantineProvider>
  </React.StrictMode>,
)
