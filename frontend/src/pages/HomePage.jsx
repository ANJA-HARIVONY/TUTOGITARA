import { Link as RouterLink } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import SchoolIcon from '@mui/icons-material/School';
import TimelineIcon from '@mui/icons-material/Timeline';
import { useAuth } from '../auth/AuthContext';

const PATHS = [
  {
    level: 'Débutant',
    title: 'Premiers accords',
    text: 'Tenue, accordage et accords ouverts pour jouer tout de suite.',
  },
  {
    level: 'Intermédiaire',
    title: 'Rythme et enchaînements',
    text: 'Grattages, barrés et premiers morceaux, à ton tempo.',
  },
  {
    level: 'Avancé',
    title: 'Morceaux et nuances',
    text: 'Répertoire, dynamique et solos, leçon après leçon.',
  },
];

const STEPS = [
  {
    icon: SchoolIcon,
    title: 'Choisis ton niveau',
    text: 'Débutant, intermédiaire ou avancé : le catalogue se filtre une fois le compte ouvert.',
  },
  {
    icon: PlayCircleOutlineIcon,
    title: 'Regarde les leçons',
    text: 'Chaque parcours est une suite de vidéos, à suivre quand tu as ta guitare sous la main.',
  },
  {
    icon: TimelineIcon,
    title: 'Reprends où tu t’es arrêté',
    text: 'La progression est enregistrée. Tu relances la leçon au bon endroit.',
  },
];

const POINTS = [
  { value: '3 niveaux', label: 'Du premier accord au répertoire' },
  { value: 'Vidéo', label: 'Des leçons à regarder à ton rythme' },
  { value: 'Suivi', label: 'Une place gardée dans chaque parcours' },
];

function PathCard({ path, to }) {
  return (
    <Card
      component={RouterLink}
      to={to}
      sx={{
        color: 'inherit',
        textDecoration: 'none',
        transition: 'transform 0.2s ease',
        '&:hover': { transform: 'translateY(-3px)' },
      }}
    >
      <CardContent>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            <MusicNoteIcon />
          </Box>
          <Box>
            <Typography variant="overline" color="secondary" sx={{ fontWeight: 700, lineHeight: 1.4 }}>
              {path.level}
            </Typography>
            <Typography variant="h6" component="h3">{path.title}</Typography>
            <Typography variant="body2" color="text.secondary">{path.text}</Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const coursesTo = user ? '/catalogue' : '/connexion';

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar
        position="sticky"
        color="inherit"
        sx={{ bgcolor: 'background.paper', color: 'text.primary', borderBottom: 1, borderColor: 'divider' }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ gap: 1 }}>
            <MusicNoteIcon color="primary" />
            <Typography
              variant="h6"
              component={RouterLink}
              to="/"
              sx={{
                color: 'inherit',
                textDecoration: 'none',
                mr: 1,
                whiteSpace: 'nowrap',
                fontSize: { xs: '1.05rem', sm: '1.25rem' },
              }}
            >
              Fianarana Guitara
            </Typography>
            <Button
              component={RouterLink}
              to={coursesTo}
              color="inherit"
              sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
            >
              Cours
            </Button>
            <Box sx={{ flexGrow: 1 }} />
            {user ? (
              <Button component={RouterLink} to="/catalogue" variant="contained">
                Mes cours
              </Button>
            ) : (
              <Stack direction="row" spacing={1}>
                <Button
                  component={RouterLink}
                  to="/connexion"
                  color="inherit"
                  sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
                >
                  Connexion
                </Button>
                <Button component={RouterLink} to="/inscription" variant="contained">
                  S’inscrire
                </Button>
              </Stack>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1 }}>
        <Box sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
          <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
            <Box
              sx={{
                display: 'grid',
                gap: { xs: 5, md: 8 },
                gridTemplateColumns: { xs: '1fr', md: '1.15fr 0.85fr' },
                alignItems: 'center',
              }}
            >
              <Stack spacing={3}>
                <Typography variant="overline" color="secondary" sx={{ fontWeight: 700, letterSpacing: 1.4 }}>
                  Cours de guitare en ligne
                </Typography>
                <Typography
                  variant="h2"
                  component="h1"
                  sx={{ fontWeight: 800, fontSize: { xs: '2.5rem', md: '3.6rem' }, lineHeight: 1.08 }}
                >
                  Apprends la guitare, à ton rythme.
                </Typography>
                <Typography variant="h6" component="p" color="text.secondary" sx={{ fontWeight: 400, maxWidth: 540 }}>
                  Des parcours en vidéo, du premier accord jusqu’aux morceaux que tu veux jouer.
                  Le catalogue s’ouvre après connexion.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <Button component={RouterLink} to={coursesTo} variant="contained" size="large">
                    Voir les cours
                  </Button>
                  {!user && (
                    <Button component={RouterLink} to="/inscription" variant="outlined" size="large">
                      Créer un compte
                    </Button>
                  )}
                </Stack>
              </Stack>
              <Stack spacing={2}>
                {PATHS.map((path) => (
                  <PathCard key={path.title} path={path} to={coursesTo} />
                ))}
              </Stack>
            </Box>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
            }}
          >
            {POINTS.map((point) => (
              <Card key={point.value} variant="outlined" sx={{ bgcolor: 'transparent' }}>
                <CardContent>
                  <Typography variant="h5" component="p">{point.value}</Typography>
                  <Typography color="text.secondary">{point.label}</Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Container>

        <Box sx={{ bgcolor: 'background.paper', borderTop: 1, borderBottom: 1, borderColor: 'divider' }}>
          <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
            <Stack spacing={1} sx={{ mb: 4, maxWidth: 640 }}>
              <Typography variant="h4" component="h2">Une méthode simple</Typography>
              <Typography color="text.secondary">
                Comme une école en ligne : tu vois ce qui t’attend, puis tu entres dans les cours avec ton compte.
              </Typography>
            </Stack>
            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              }}
            >
              {STEPS.map((step) => {
                const Icon = step.icon;
                return (
                  <Card key={step.title} sx={{ height: '100%' }}>
                    <CardContent>
                      <Stack spacing={1.5}>
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 2,
                            bgcolor: 'secondary.main',
                            color: 'secondary.contrastText',
                            display: 'grid',
                            placeItems: 'center',
                          }}
                        >
                          <Icon />
                        </Box>
                        <Typography variant="h6" component="h3">{step.title}</Typography>
                        <Typography color="text.secondary">{step.text}</Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          </Container>
        </Box>

        <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 }, textAlign: 'center' }}>
          <Stack spacing={2} sx={{ alignItems: 'center' }}>
            <Typography variant="h4" component="h2">Prêt à jouer ?</Typography>
            <Typography color="text.secondary" sx={{ maxWidth: 480 }}>
              La page d’accueil est ouverte à tous. Pour voir les cours, passe par la connexion.
            </Typography>
            <Button component={RouterLink} to={coursesTo} variant="contained" size="large">
              {user ? 'Ouvrir le catalogue' : 'Se connecter pour voir les cours'}
            </Button>
          </Stack>
        </Container>
      </Box>

      <Box
        component="footer"
        sx={{ py: 3, bgcolor: 'primary.main', color: 'primary.contrastText' }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2">
            Fianarana Guitara — cours de guitare réservés aux comptes connectés.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
