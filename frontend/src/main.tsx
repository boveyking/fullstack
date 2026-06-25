import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

import '@mantine/core/styles.css';
import { MantineProvider, createTheme } from '@mantine/core';

const theme = createTheme({
  primaryColor: 'gray',
  fontFamily: 'Satoshi, satoshi, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
  colors: {
    dark: [
      '#C1C2C5',
      '#A6A7AB',
      '#909296',
      '#5c5f66',
      '#373A40',
      '#2C2E33',
      '#25262b',
      '#1A1B1E',
      '#141517',
      '#101113',
    ],
  },
  defaultRadius: 'md',
  components: {
    Text: {
      defaultProps: {
        size: 'lg', // Default text size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
      },
    },
  },
  // Optional: Customize font sizes globally
  // fontSizes: {
  //   xs: '12px',
  //   sm: '14px',
  //   md: '16px',
  //   lg: '18px',
  //   xl: '20px',
  // },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <App />
    </MantineProvider>
  </React.StrictMode>,
)
