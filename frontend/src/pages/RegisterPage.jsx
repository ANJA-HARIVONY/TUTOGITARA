import { useState } from 'react';
import { Link as RouterLink, Navigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useAuth } from '../auth/AuthContext';
import AuthCard from '../components/AuthCard';

export default function RegisterPage() {
  const { user, ready, register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  if (ready && user) return <Navigate to="/catalogue" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setPending(true);
    setError('');
    try {
      await register({ name, email, password });
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthCard
      title="Inscription"
      subtitle="Un compte élève pour suivre les cours."
      footer={(
        <Stack spacing={1}>
          <Link component={RouterLink} to="/connexion">
            J’ai déjà un compte
          </Link>
          <Link component={RouterLink} to="/">
            Retour à l’accueil
          </Link>
        </Stack>
      )}
    >
      <Stack component="form" spacing={2} onSubmit={handleSubmit}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          label="Nom"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          autoComplete="name"
          fullWidth
        />
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
          autoComplete="new-password"
          helperText="8 caractères minimum"
          fullWidth
        />
        <Button type="submit" variant="contained" size="large" disabled={pending}>
          {pending ? 'Création…' : 'Créer mon compte'}
        </Button>
      </Stack>
    </AuthCard>
  );
}
