import { Box, Container, AppBar, Toolbar, Button } from '@mui/material'
import { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

interface LayoutProps {
  children: ReactNode
}

function Layout({ children }: LayoutProps) {
  const navigate = useNavigate()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Button color="inherit" onClick={() => navigate('/instances')}>
            Instances
          </Button>
          <Button color="inherit" onClick={() => navigate('/users')}>
            Users
          </Button>
          <Button color="inherit" onClick={() => navigate('/subscriptions')}>
            Subscriptions
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flex: 1 }}>
        {children}
      </Container>
    </Box>
  )
}

export default Layout
