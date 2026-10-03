import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { api } from '../../api';
import LevelChip from '../../components/LevelChip';
import { LEVEL_OPTIONS } from '../../levels';

function openPath(course) {
  if (course.resumeLessonId) return `/cours/${course.id}/lecons/${course.resumeLessonId}`;
  return `/cours/${course.id}`;
}

function openLabel(course) {
  if (!course.lessonCount) return 'Voir le parcours';
  if ((course.percent || 0) >= 100) return 'Revoir';
  if ((course.percent || 0) > 0) return 'Continuer';
  return 'Commencer';
}

function CourseCard({ course }) {
  const destination = openPath(course);
  const coursePath = `/cours/${course.id}`;
  const percent = course.percent || 0;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ height: '100%' }}>
        <Stack spacing={1.5} sx={{ height: '100%' }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Typography variant="h6" component="h2" sx={{ flexGrow: 1 }}>{course.title}</Typography>
            <LevelChip level={course.level} />
          </Stack>
          <Typography
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {course.description || 'Sans description'}
          </Typography>
          <Typography variant="body2">
            {`${course.lessonCount} leçon${course.lessonCount > 1 ? 's' : ''}${course.lessonCount > 0 ? ` · ${percent} %` : ''}`}
          </Typography>
          {course.lessonCount > 0 && (
            <LinearProgress variant="determinate" value={percent} aria-label={`Avancement de ${course.title}`} />
          )}
          {!course.published && <Chip size="small" label="Brouillon" sx={{ alignSelf: 'flex-start' }} />}
          <Box sx={{ flexGrow: 1 }} />
          <Stack direction="row" spacing={1}>
            <Button component={RouterLink} to={destination} variant="contained">
              {openLabel(course)}
            </Button>
            {destination !== coursePath && (
              <Button component={RouterLink} to={coursePath}>Parcours</Button>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function CatalogPage() {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState('tous');

  useEffect(() => {
    let active = true;
    api.courses()
      .then((data) => {
        if (active) setCourses(data.courses);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const visible = useMemo(
    () => courses.filter((course) => level === 'tous' || course.level === level),
    [courses, level],
  );
  const resume = useMemo(() => visible
    .filter((course) => course.percent > 0 && course.percent < 100)
    .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)), [visible]);
  const others = useMemo(() => {
    const resumeIds = new Set(resume.map((course) => course.id));
    return visible.filter((course) => !resumeIds.has(course.id));
  }, [visible, resume]);

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" component="h1">Catalogue</Typography>
        <Typography color="text.secondary">
          Choisis un parcours, puis reprends la leçon là où tu t’es arrêté.
        </Typography>
      </Box>
      <ToggleButtonGroup
        exclusive
        value={level}
        onChange={(event, value) => {
          if (value) setLevel(value);
        }}
        aria-label="Filtrer par niveau"
        size="small"
      >
        <ToggleButton value="tous">Tous</ToggleButton>
        {LEVEL_OPTIONS.map((option) => (
          <ToggleButton key={option.value} value={option.value}>{option.label}</ToggleButton>
        ))}
      </ToggleButtonGroup>
      {loading && <LinearProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && courses.length === 0 && (
        <Alert severity="info">Aucun cours publié pour le moment.</Alert>
      )}
      {!loading && courses.length > 0 && visible.length === 0 && (
        <Alert severity="info">Aucun cours pour ce niveau.</Alert>
      )}
      {resume.length > 0 && (
        <Stack spacing={2}>
          <Typography variant="h5" component="h2">Reprendre</Typography>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
            {resume.map((course) => <CourseCard key={course.id} course={course} />)}
          </Box>
        </Stack>
      )}
      {others.length > 0 && (
        <Stack spacing={2}>
          <Typography variant="h5" component="h2">
            {resume.length > 0 ? 'Autres parcours' : 'Parcours'}
          </Typography>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
            {others.map((course) => <CourseCard key={course.id} course={course} />)}
          </Box>
        </Stack>
      )}
    </Stack>
  );
}
