import { Link as RouterLink, Outlet, useLocation } from 'react-router-dom';
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
import AdminNav from './AdminNav';

function NavButton({ to, active, children }) {
  return (
    <Button
      component={RouterLink}
      to={to}
      color="inherit"
      sx={{
        fontWeight: active ? 700 : 500,
        borderBottom: 2,
        borderColor: active ? 'secondary.main' : 'transparent',
        borderRadius: 0,
        px: 1.5,
      }}
    >
      {children}
    </Button>
  );
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const onCatalog = pathname === '/catalogue' || pathname.startsWith('/cours');
  const onAdmin = pathname.startsWith('/admin');

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="sticky" color="primary">
        <Toolbar sx={{ gap: 1 }}>
          <MusicNoteIcon />
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{ color: 'inherit', textDecoration: 'none', mr: 1 }}
          >
            Fianarana Guitara
          </Typography>
          <NavButton to="/catalogue" active={onCatalog}>Catalogue</NavButton>
          {user?.role === 'admin' && (
            <NavButton to="/admin" active={onAdmin}>Administration</NavButton>
          )}
          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
            {user?.name}
          </Typography>
          <IconButton color="inherit" aria-label="Se déconnecter" onClick={logout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      {onAdmin && (
        <Box sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
          <Container maxWidth="lg">
            <AdminNav />
          </Container>
        </Box>
      )}
      <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
