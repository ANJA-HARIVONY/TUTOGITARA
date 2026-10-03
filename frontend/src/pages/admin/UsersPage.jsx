import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { api } from '../../api';
import { useAuth } from '../../auth/AuthContext';

const emptyForm = { name: '', email: '', password: '', role: 'student' };

const ROLE_OPTIONS = [
  { value: 'student', label: 'Élève' },
  { value: 'admin', label: 'Administrateur' },
];

function roleLabel(role) {
  return ROLE_OPTIONS.find((option) => option.value === role)?.label || role;
}

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [passwordTarget, setPasswordTarget] = useState(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function loadUsers() {
    const data = await api.users();
    setUsers(data.users);
  }

  useEffect(() => {
    loadUsers().catch((err) => setError(err.message));
  }, []);

  async function createUser(event) {
    event.preventDefault();
    setPending(true);
    setError('');
    try {
      await api.createUser(form);
      setForm(emptyForm);
      await loadUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }

  async function changeRole(account, role) {
    setError('');
    try {
      await api.updateUser(account.id, { role });
      await loadUsers();
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeUser() {
    if (!deleteTarget) return;
    setError('');
    try {
      await api.deleteUser(deleteTarget.id);
      setDeleteTarget(null);
      await loadUsers();
    } catch (err) {
      setError(err.message);
    }
  }

  async function resetPassword(event) {
    event.preventDefault();
    if (!passwordTarget) return;
    setPending(true);
    setError('');
    try {
      await api.updateUser(passwordTarget.id, { password });
      setPasswordTarget(null);
      setPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" component="h1">Élèves</Typography>
        <Typography color="text.secondary">Crée un élève ou un autre administrateur.</Typography>
      </Box>
      {error && <Alert severity="error">{error}</Alert>}
      <Card>
        <CardContent>
          <Stack component="form" spacing={2} onSubmit={createUser}>
            <Typography variant="h6" component="h2">Nouveau compte</Typography>
            <TextField
              label="Nom"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              required
              fullWidth
            />
            <TextField
              label="E-mail"
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Mot de passe"
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              helperText="8 caractères minimum"
              required
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel id="new-user-role">Rôle</InputLabel>
              <Select
                labelId="new-user-role"
                label="Rôle"
                value={form.role}
                onChange={(event) => setForm({ ...form, role: event.target.value })}
              >
                {ROLE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button type="submit" variant="contained" disabled={pending} sx={{ alignSelf: 'flex-start' }}>
              Créer le compte
            </Button>
          </Stack>
        </CardContent>
      </Card>
      <Stack spacing={2}>
        {users.map((account) => {
          const isSelf = account.id === currentUser?.id;
          return (
            <Card key={account.id} variant="outlined">
              <CardContent>
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                    <Typography variant="h6" component="h2" sx={{ flexGrow: 1 }}>{account.name}</Typography>
                    {isSelf && <Chip size="small" label="Vous" />}
                    <Chip size="small" color={account.role === 'admin' ? 'primary' : 'default'} label={roleLabel(account.role)} />
                  </Stack>
                  <Typography color="text.secondary">{account.email}</Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignItems: { sm: 'center' } }}>
                    <FormControl size="small" sx={{ minWidth: 200 }} disabled={isSelf}>
                      <InputLabel id={`role-${account.id}`}>Rôle</InputLabel>
                      <Select
                        labelId={`role-${account.id}`}
                        label="Rôle"
                        value={account.role}
                        onChange={(event) => changeRole(account, event.target.value)}
                      >
                        {ROLE_OPTIONS.map((option) => (
                          <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {account.role === 'student' && (
                      <Button component={RouterLink} to={`/admin/suivi/${account.id}`} variant="outlined">
                        Suivi
                      </Button>
                    )}
                    <Button variant="outlined" onClick={() => { setPassword(''); setPasswordTarget(account); }}>
                      Mot de passe
                    </Button>
                    <Button color="error" disabled={isSelf} onClick={() => setDeleteTarget(account)}>
                      Supprimer
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Stack>
      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Supprimer ce compte ?</DialogTitle>
        <DialogContent>
          <Typography>
            {deleteTarget ? `${deleteTarget.name} (${deleteTarget.email}) n'aura plus accès aux cours.` : ''}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Annuler</Button>
          <Button color="error" onClick={removeUser}>Supprimer</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={Boolean(passwordTarget)} onClose={() => setPasswordTarget(null)}>
        <DialogTitle>Nouveau mot de passe</DialogTitle>
        <Stack component="form" onSubmit={resetPassword}>
          <DialogContent>
            <TextField
              label="Mot de passe"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              helperText="8 caractères minimum"
              required
              fullWidth
              autoFocus
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPasswordTarget(null)}>Annuler</Button>
            <Button type="submit" variant="contained" disabled={pending}>Enregistrer</Button>
          </DialogActions>
        </Stack>
      </Dialog>
    </Stack>
  );
}
