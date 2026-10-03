import { useEffect, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { api } from '../../api';
import LevelChip from '../../components/LevelChip';

function formatActivity(value) {
  if (!value) return 'Pas encore commencé';
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function StudentProgressPage() {
  const { userId } = useParams();
  const [student, setStudent] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api.userProgress(userId)
      .then((data) => {
        if (active) setStudent(data.student);
      })
      .catch((err) => {
        if (active) setError(err.message);
      });
    return () => {
      active = false;
    };
  }, [userId]);

  if (error && !student) return <Alert severity="error">{error}</Alert>;
  if (!student) return <Typography>Chargement du suivi…</Typography>;

  return (
    <Stack spacing={3}>
      <Button
        component={RouterLink}
        to="/admin/suivi"
        startIcon={<ArrowBackIcon />}
        sx={{ alignSelf: 'flex-start' }}
      >
        Retour au suivi
      </Button>
      <Stack spacing={0.5}>
        <Typography variant="h4" component="h1">{student.name}</Typography>
        <Typography color="text.secondary">{student.email}</Typography>
        <Typography variant="body2">
          {`${student.coursesStarted} parcours commencé${student.coursesStarted > 1 ? 's' : ''} · moyenne ${student.averagePercent} % · ${formatActivity(student.lastActivityAt)}`}
        </Typography>
      </Stack>
      {student.courses.length === 0 && (
        <Alert severity="info">Aucun parcours à afficher.</Alert>
      )}
      {student.courses.map((course) => (
        <Accordion key={course.courseId} defaultExpanded={Boolean(course.updatedAt)} disableGutters>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Stack spacing={1} sx={{ flexGrow: 1, pr: 2 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                <Typography sx={{ flexGrow: 1 }}>{course.title}</Typography>
                <LevelChip level={course.level} />
                {!course.published && <Chip size="small" label="Brouillon" />}
                <Typography variant="body2">{course.percent} %</Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={course.percent}
                aria-label={`Avancement de ${course.title}`}
              />
              <Typography variant="body2" color="text.secondary">
                {course.completedCount}/{course.lessonCount} leçons
                {course.lastLessonTitle ? ` · dernière leçon : ${course.lastLessonTitle}` : ''}
                {' · '}
                {formatActivity(course.updatedAt)}
              </Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={1.5}>
              {course.lessons.length === 0 && (
                <Typography color="text.secondary">Ce parcours n’a pas de leçon.</Typography>
              )}
              {course.lessons.map((lesson) => (
                <Stack key={lesson.id} spacing={0.5}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Typography sx={{ flexGrow: 1 }}>
                      {lesson.order}. {lesson.title}
                    </Typography>
                    <Typography variant="body2">{lesson.percent} %</Typography>
                    {lesson.percent >= 100 && <CheckCircleIcon color="success" fontSize="small" />}
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={lesson.percent}
                    aria-label={`Progression de ${lesson.title}`}
                  />
                </Stack>
              ))}
            </Stack>
          </AccordionDetails>
        </Accordion>
      ))}
    </Stack>
  );
}
