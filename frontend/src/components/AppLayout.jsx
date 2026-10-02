import { Link as RouterLink, Outlet } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import LogoutIcon from '@mui/icons-material/Logout';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import { useAuth } from '../auth/AuthContext';

export default function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <AppBar position="sticky" color="primary">
        <Toolbar>
          <MusicNoteIcon sx={{ mr: 1 }} />
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{ color: 'inherit', textDecoration: 'none', flexGrow: 1 }}
          >
            Fianarana Guitara
          </Typography>
          {user?.role === 'admin' && (
            <Button component={RouterLink} to="/admin" color="inherit">
              Administration
            </Button>
          )}
          <Typography variant="body2" sx={{ mx: 2 }}>
            {user?.name}
          </Typography>
          <IconButton color="inherit" aria-label="Se déconnecter" onClick={logout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Container sx={{ py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
