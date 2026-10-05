import { useEffect, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import LinearProgress from '@mui/material/LinearProgress';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { api } from '../../api';
import LevelChip from '../../components/LevelChip';
import PageBreadcrumbs from '../../components/PageBreadcrumbs';

const emptyProgress = { completedLessonIds: [], lastLessonId: null, lessonPercents: [] };

function percentFor(progress, lessonId) {
  if (progress.completedLessonIds.includes(lessonId)) return 100;
  return progress.lessonPercents.find((item) => item.lessonId === lessonId)?.percent || 0;
}

function resumeLesson(lessons, progress) {
  const last = lessons.find((lesson) => lesson.id === progress.lastLessonId);
  if (last && percentFor(progress, last.id) < 100) return last;
  const unfinished = lessons.find((lesson) => percentFor(progress, lesson.id) < 100);
  if (unfinished) return unfinished;
  return last || lessons[0] || null;
}

export default function CoursePage() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState(emptyProgress);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api.course(id)
      .then((data) => {
        if (!active) return;
        setCourse(data.course);
        setLessons(data.lessons);
        setProgress({ ...emptyProgress, ...data.progress, lessonPercents: data.progress.lessonPercents || [] });
      })
      .catch((err) => {
        if (active) setError(err.message);
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (error && !course) return <Alert severity="error">{error}</Alert>;
  if (!course) return <Typography>Chargement du parcours…</Typography>;

  const doneCount = lessons.filter((lesson) => percentFor(progress, lesson.id) >= 100).length;
  const percent = lessons.length
    ? Math.round(lessons.reduce((sum, lesson) => sum + percentFor(progress, lesson.id), 0) / lessons.length)
    : 0;
  const nextLesson = resumeLesson(lessons, progress);
  const started = percent > 0;
  const finished = lessons.length > 0 && doneCount === lessons.length;
  let actionLabel = 'Commencer';
  if (finished) actionLabel = 'Revoir';
  else if (started) actionLabel = 'Continuer';

  return (
    <Stack spacing={3}>
      <PageBreadcrumbs items={[{ label: 'Catalogue', to: '/catalogue' }, { label: course.title }]} />
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'flex-start' } }}>
        <Box sx={{ flexGrow: 1 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
            <Typography variant="h4" component="h1">{course.title}</Typography>
            <LevelChip level={course.level} />
          </Stack>
          <Typography color="text.secondary">{course.description || 'Sans description'}</Typography>
        </Box>
        {nextLesson && (
          <Button
            component={RouterLink}
            to={`/cours/${course.id}/lecons/${nextLesson.id}`}
            variant="contained"
            size="large"
            startIcon={<PlayArrowIcon />}
          >
            {actionLabel}
          </Button>
        )}
      </Stack>
      <Stack spacing={1}>
        <Typography variant="body2">
          {lessons.length === 0
            ? 'Aucune leçon pour le moment'
            : `${doneCount}/${lessons.length} leçons · ${percent} %`}
        </Typography>
        {lessons.length > 0 && (
          <LinearProgress variant="determinate" value={percent} aria-label={`Avancement de ${course.title}`} />
        )}
      </Stack>
      {lessons.length === 0 && <Alert severity="info">Ce parcours n’a pas encore de leçon.</Alert>}
      {lessons.length > 0 && (
        <Card>
          <List disablePadding>
            {lessons.map((lesson, index) => {
              const lessonPercent = percentFor(progress, lesson.id);
              return (
                <ListItemButton
                  key={lesson.id}
                  component={RouterLink}
                  to={`/cours/${course.id}/lecons/${lesson.id}`}
                  divider={index < lessons.length - 1}
                  sx={{ py: 1.5, display: 'block' }}
                >
                  <Stack spacing={0.75}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <Typography sx={{ flexGrow: 1 }}>
                        {lesson.order}. {lesson.title}
                      </Typography>
                      <Typography variant="body2">{lessonPercent} %</Typography>
                      {lessonPercent >= 100 && <CheckCircleIcon color="success" fontSize="small" />}
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={lessonPercent}
                      aria-label={`Progression de ${lesson.title}`}
                    />
                  </Stack>
                </ListItemButton>
              );
            })}
          </List>
        </Card>
      )}
    </Stack>
  );
}
