import { useEffect, useRef, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { api } from '../../api';
import PageBreadcrumbs from '../../components/PageBreadcrumbs';

const emptyProgress = { completedLessonIds: [], lastLessonId: null, lessonPercents: [] };

function percentFor(progress, lessonId) {
  if (progress.completedLessonIds.includes(lessonId)) return 100;
  return progress.lessonPercents.find((item) => item.lessonId === lessonId)?.percent || 0;
}

function withPercent(progress, lessonId, percent) {
  const next = Math.max(percentFor(progress, lessonId), Math.min(100, percent));
  const lessonPercents = progress.lessonPercents.filter((item) => item.lessonId !== lessonId);
  lessonPercents.push({ lessonId, percent: next });
  const completedLessonIds = next >= 100 && !progress.completedLessonIds.includes(lessonId)
    ? [...progress.completedLessonIds, lessonId]
    : progress.completedLessonIds;
  return { ...progress, lessonPercents, completedLessonIds };
}

function mergeProgress(current, incoming) {
  const map = new Map(current.lessonPercents.map((item) => [item.lessonId, item.percent]));
  for (const item of incoming.lessonPercents || []) {
    map.set(item.lessonId, Math.max(map.get(item.lessonId) || 0, item.percent));
  }
  const completed = new Set([
    ...current.completedLessonIds,
    ...(incoming.completedLessonIds || []),
  ]);
  return {
    lastLessonId: incoming.lastLessonId || current.lastLessonId,
    completedLessonIds: [...completed],
    lessonPercents: [...map].map(([lessonKey, percent]) => ({ lessonId: lessonKey, percent })),
  };
}

export default function LessonPage() {
  const { id, lessonId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState(emptyProgress);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const persisted = useRef({});
  const resumed = useRef(false);

  useEffect(() => {
    let active = true;
    api.course(id)
      .then((data) => {
        if (!active) return;
        setCourse(data.course);
        setLessons(data.lessons);
        setProgress({ ...emptyProgress, ...data.progress, lessonPercents: data.progress.lessonPercents || [] });
        for (const item of data.progress.lessonPercents || []) {
          persisted.current[item.lessonId] = item.percent;
        }
        for (const lessonKey of data.progress.completedLessonIds || []) {
          persisted.current[lessonKey] = 100;
        }
      })
      .catch((err) => {
        if (active) setError(err.message);
      });
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    resumed.current = false;
  }, [lessonId]);

  useEffect(() => {
    if (!lessonId || !course) return undefined;
    if (!lessons.some((lesson) => lesson.id === lessonId)) return undefined;
    let active = true;
    api.visitLesson(id, lessonId)
      .then((data) => {
        if (active) setProgress((current) => mergeProgress(current, data.progress));
      })
      .catch((err) => {
        if (active) setError(err.message);
      });
    return () => {
      active = false;
    };
  }, [id, lessonId, course, lessons]);

  const selected = lessons.find((lesson) => lesson.id === lessonId) || null;
  const selectedIndex = lessons.findIndex((lesson) => lesson.id === lessonId);
  const previous = selectedIndex > 0 ? lessons[selectedIndex - 1] : null;
  const next = selectedIndex >= 0 && selectedIndex < lessons.length - 1 ? lessons[selectedIndex + 1] : null;
  const selectedPercent = selected ? percentFor(progress, selected.id) : 0;
  const completed = selectedPercent >= 100;
  const doneCount = lessons.filter((lesson) => percentFor(progress, lesson.id) >= 100).length;

  function openLesson(nextId) {
    navigate(`/cours/${id}/lecons/${nextId}`);
  }

  function rememberPercent(currentLessonId, percent) {
    setProgress((current) => withPercent(current, currentLessonId, percent));
    const previousPercent = persisted.current[currentLessonId] || 0;
    if (percent < 100 && percent < previousPercent + 5) return;
    persisted.current[currentLessonId] = percent;
    api.saveLessonProgress(id, currentLessonId, percent).catch((err) => setError(err.message));
  }

  function handleTimeUpdate(event) {
    if (!selected?.hasVideo) return;
    const video = event.currentTarget;
    if (!Number.isFinite(video.duration) || video.duration <= 0) return;
    const raw = Math.round((video.currentTime / video.duration) * 100);
    const percent = video.ended ? 100 : Math.min(raw, 99);
    rememberPercent(selected.id, percent);
  }

  function handleEnded() {
    if (selected) rememberPercent(selected.id, 100);
  }

  function handleLoadedMetadata(event) {
    if (resumed.current || !selected) return;
    const percent = percentFor(progress, selected.id);
    const video = event.currentTarget;
    if (percent <= 0 || percent >= 100 || !video.duration) return;
    resumed.current = true;
    video.currentTime = (percent / 100) * video.duration;
  }

  async function markComplete() {
    if (!selected) return;
    setPending(true);
    setError('');
    try {
      const data = await api.completeLesson(id, selected.id);
      persisted.current[selected.id] = 100;
      setProgress((current) => mergeProgress(
        { ...emptyProgress, ...data.progress, lessonPercents: data.progress.lessonPercents || [] },
        current,
      ));
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
      <PageBreadcrumbs
        items={[
          { label: 'Catalogue', to: '/catalogue' },
          { label: course.title, to: `/cours/${course.id}` },
          { label: selected?.title || 'Leçon' },
        ]}
      />
      {error && <Alert severity="error">{error}</Alert>}
      {lessons.length === 0 && <Alert severity="info">Ce cours n’a pas encore de leçon.</Alert>}
      {lessons.length > 0 && !selected && (
        <Alert
          severity="warning"
          action={(
            <Button component={RouterLink} to={`/cours/${course.id}`} color="inherit">
              Parcours
            </Button>
          )}
        >
          Cette leçon est introuvable.
        </Alert>
      )}
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '320px 1fr' }, alignItems: 'start' }}>
        <Card>
          <Box sx={{ px: 2, pt: 2 }}>
            <Typography variant="subtitle1">Parcours</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {doneCount}/{lessons.length} leçons
            </Typography>
          </Box>
          <List>
            {lessons.map((lesson) => {
              const percent = percentFor(progress, lesson.id);
              return (
                <ListItemButton
                  key={lesson.id}
                  selected={lesson.id === lessonId}
                  onClick={() => openLesson(lesson.id)}
                  sx={{ display: 'block' }}
                >
                  <Stack spacing={0.75}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <Typography sx={{ flexGrow: 1 }}>{lesson.order}. {lesson.title}</Typography>
                      <Typography variant="body2">{percent} %</Typography>
                      {percent >= 100 && <CheckCircleIcon color="success" fontSize="small" />}
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={percent}
                      aria-label={`Progression de ${lesson.title}`}
                    />
                  </Stack>
                </ListItemButton>
              );
            })}
          </List>
        </Card>
        <Card>
          <CardContent>
            {selected ? (
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Typography variant="h6" component="h2" sx={{ flexGrow: 1 }}>{selected.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedIndex + 1}/{lessons.length}
                  </Typography>
                  <Typography>{selectedPercent} %</Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={selectedPercent}
                  aria-label={`Progression de ${selected.title}`}
                />
                {selected.hasVideo ? (
                  <Box
                    component="video"
                    key={selected.id}
                    controls
                    controlsList="nodownload"
                    onContextMenu={(event) => event.preventDefault()}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={handleEnded}
                    onLoadedMetadata={handleLoadedMetadata}
                    src={api.streamUrl(selected.id)}
                    sx={{ width: '100%', borderRadius: 2, backgroundColor: '#1A140F' }}
                  />
                ) : (
                  <Alert severity="info">Cette leçon n’a pas encore de vidéo.</Alert>
                )}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ justifyContent: 'space-between' }}>
                  <Button
                    startIcon={<ArrowBackIcon />}
                    disabled={!previous}
                    onClick={() => previous && openLesson(previous.id)}
                  >
                    Précédent
                  </Button>
                  <Button variant="contained" onClick={markComplete} disabled={pending || completed}>
                    {completed ? 'Leçon terminée' : 'Marquer comme terminée'}
                  </Button>
                  {next ? (
                    <Button
                      variant="contained"
                      endIcon={<ArrowForwardIcon />}
                      onClick={() => openLesson(next.id)}
                    >
                      Suivant
                    </Button>
                  ) : (
                    <Button component={RouterLink} to={`/cours/${course.id}`} variant="outlined">
                      Fin du parcours
                    </Button>
                  )}
                </Stack>
              </Stack>
            ) : (
              <Typography color="text.secondary">Sélectionne une leçon dans le parcours.</Typography>
            )}
          </CardContent>
        </Card>
      </Box>
    </Stack>
  );
}
