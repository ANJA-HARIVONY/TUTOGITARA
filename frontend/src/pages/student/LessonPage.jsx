import { useEffect, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { api } from '../../api';
import LevelChip from '../../components/LevelChip';

export default function LessonPage() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState({ completedLessonIds: [], lastLessonId: null });
  const [selectedId, setSelectedId] = useState(null);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let active = true;
    api.course(id)
      .then((data) => {
        if (!active) return;
        setCourse(data.course);
        setLessons(data.lessons);
        setProgress(data.progress);
        const preferred = data.lessons.find((lesson) => lesson.id === data.progress.lastLessonId) || data.lessons[0];
        setSelectedId(preferred?.id || null);
      })
      .catch((err) => {
        if (active) setError(err.message);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const selected = lessons.find((lesson) => lesson.id === selectedId) || null;
  const completed = selected ? progress.completedLessonIds.includes(selected.id) : false;

  async function selectLesson(lessonId) {
    setSelectedId(lessonId);
    try {
      const data = await api.visitLesson(id, lessonId);
      setProgress(data.progress);
    } catch (err) {
      setError(err.message);
    }
  }

  async function markComplete() {
    if (!selected) return;
    setPending(true);
    setError('');
    try {
      const data = await api.completeLesson(id, selected.id);
      setProgress(data.progress);
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }

  if (error && !course) return <Alert severity="error">{error}</Alert>;
  if (!course) return <Typography>Chargement du cours…</Typography>;

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" component="h1">{course.title}</Typography>
          <Typography color="text.secondary">{course.description}</Typography>
        </Box>
        <LevelChip level={course.level} />
      </Stack>
      <Button component={RouterLink} to="/" sx={{ alignSelf: 'flex-start' }}>
        Retour aux cours
      </Button>
      {error && <Alert severity="error">{error}</Alert>}
      {lessons.length === 0 && <Alert severity="info">Ce cours n'a pas encore de leçon.</Alert>}
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '280px 1fr' } }}>
        <Card>
          <List>
            {lessons.map((lesson) => (
              <ListItemButton
                key={lesson.id}
                selected={lesson.id === selectedId}
                onClick={() => selectLesson(lesson.id)}
              >
                <ListItemText primary={`${lesson.order}. ${lesson.title}`} />
                {progress.completedLessonIds.includes(lesson.id) && <CheckCircleIcon color="success" fontSize="small" />}
              </ListItemButton>
            ))}
          </List>
        </Card>
        <Card>
          <CardContent>
            {selected ? (
              <Stack spacing={2}>
                <Typography variant="h6" component="h2">{selected.title}</Typography>
                {selected.hasVideo ? (
                  <Box
                    component="video"
                    key={selected.id}
                    controls
                    controlsList="nodownload"
                    onContextMenu={(event) => event.preventDefault()}
                    src={api.streamUrl(selected.id)}
                    sx={{ width: '100%', borderRadius: 2, backgroundColor: '#1A140F' }}
                  />
                ) : (
                  <Alert severity="info">Cette leçon n'a pas encore de vidéo.</Alert>
                )}
                <Button variant="contained" onClick={markComplete} disabled={pending || completed}>
                  {completed ? 'Leçon terminée' : 'Marquer comme terminée'}
                </Button>
              </Stack>
            ) : (
              <Typography color="text.secondary">Sélectionne une leçon.</Typography>
            )}
          </CardContent>
        </Card>
      </Box>
    </Stack>
  );
}
