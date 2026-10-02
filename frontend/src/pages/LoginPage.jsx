import { useState } from 'react';
import { Link as RouterLink, Navigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useAuth } from '../auth/AuthContext';
import AuthCard from '../components/AuthCard';

export default function LoginPage() {
  const { user, ready, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  if (ready && user) return <Navigate to="/" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setPending(true);
    setError('');
    try {
      await login({ email, password });
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthCard
      title="Connexion"
      subtitle="Retrouve tes cours de guitare."
      footer={(
        <Link component={RouterLink} to="/inscription">
          Créer un compte élève
        </Link>
      )}
    >
      <Stack component="form" spacing={2} onSubmit={handleSubmit}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          label="E-mail"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
          fullWidth
        />
        <TextField
          label="Mot de passe"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          autoComplete="current-password"
          fullWidth
        />
        <Button type="submit" variant="contained" size="large" disabled={pending}>
          {pending ? 'Connexion…' : 'Se connecter'}
        </Button>
      </Stack>
    </AuthCard>
  );
}
