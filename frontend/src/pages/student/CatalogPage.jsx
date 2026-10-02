import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { api } from '../../api';
import LevelChip from '../../components/LevelChip';

export default function CatalogPage() {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

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

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" component="h1">Cours</Typography>
        <Typography color="text.secondary">Choisis une leçon et joue.</Typography>
      </Box>
      {loading && <LinearProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && courses.length === 0 && (
        <Alert severity="info">Aucun cours publié pour le moment.</Alert>
      )}
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
        {courses.map((course) => {
          const progress = course.lessonCount
            ? Math.round((course.completedCount / course.lessonCount) * 100)
            : 0;
          return (
            <Card key={course.id}>
              <CardContent>
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Typography variant="h6" component="h2" sx={{ flexGrow: 1 }}>{course.title}</Typography>
                    <LevelChip level={course.level} />
                  </Stack>
                  <Typography color="text.secondary">{course.description || 'Sans description'}</Typography>
                  <Typography variant="body2">
                    {course.completedCount}/{course.lessonCount} leçons
                    {!course.published ? ' · brouillon' : ''}
                  </Typography>
                  <LinearProgress variant="determinate" value={progress} />
                  <Button component={RouterLink} to={`/cours/${course.id}`} variant="contained">
                    Ouvrir
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </Stack>
  );
}
