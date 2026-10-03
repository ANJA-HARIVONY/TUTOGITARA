import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import { api } from '../../api';
import LevelChip from '../../components/LevelChip';
import { LEVEL_OPTIONS } from '../../levels';

const emptyCourse = { title: '', description: '', level: 'debutant' };
const emptyLesson = { title: '', order: '', file: null };

export default function AdminPage() {
  const [courses, setCourses] = useState([]);
  const [courseForm, setCourseForm] = useState(emptyCourse);
  const [selectedId, setSelectedId] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [lessonForm, setLessonForm] = useState(emptyLesson);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function loadCourses() {
    const data = await api.courses();
    setCourses(data.courses);
  }

  useEffect(() => {
    loadCourses().catch((err) => setError(err.message));
  }, []);

  async function openCourse(courseId) {
    setSelectedId(courseId);
    setError('');
    try {
      const data = await api.course(courseId);
      setLessons(data.lessons);
    } catch (err) {
      setError(err.message);
    }
  }

  async function createCourse(event) {
    event.preventDefault();
    setPending(true);
    setError('');
    try {
      await api.createCourse(courseForm);
      setCourseForm(emptyCourse);
      await loadCourses();
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }

  async function togglePublished(course) {
    setError('');
    try {
      await api.updateCourse(course.id, { published: !course.published });
      await loadCourses();
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeCourse() {
    if (!deleteTarget) return;
    setError('');
    try {
      await api.deleteCourse(deleteTarget.id);
      if (selectedId === deleteTarget.id) {
        setSelectedId(null);
        setLessons([]);
      }
      setDeleteTarget(null);
      await loadCourses();
    } catch (err) {
      setError(err.message);
    }
  }

  async function createLesson(event) {
    event.preventDefault();
    if (!selectedId) return;
    setPending(true);
    setError('');
    try {
      const formData = new FormData();
      formData.set('title', lessonForm.title);
      if (lessonForm.order) formData.set('order', lessonForm.order);
      if (lessonForm.file) formData.set('video', lessonForm.file);
      await api.createLesson(selectedId, formData);
      setLessonForm(emptyLesson);
      await openCourse(selectedId);
      await loadCourses();
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }

  const selected = courses.find((course) => course.id === selectedId) || null;

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" component="h1">Cours</Typography>
        <Typography color="text.secondary">Crée les cours, ajoute les vidéos, puis publie.</Typography>
      </Box>
      {error && <Alert severity="error">{error}</Alert>}
      <Card>
        <CardContent>
          <Stack component="form" spacing={2} onSubmit={createCourse}>
            <Typography variant="h6" component="h2">Nouveau cours</Typography>
            <TextField
              label="Titre"
              value={courseForm.title}
              onChange={(event) => setCourseForm({ ...courseForm, title: event.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Description"
              value={courseForm.description}
              onChange={(event) => setCourseForm({ ...courseForm, description: event.target.value })}
              multiline
              minRows={2}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel id="course-level">Niveau</InputLabel>
              <Select
                labelId="course-level"
                label="Niveau"
                value={courseForm.level}
                onChange={(event) => setCourseForm({ ...courseForm, level: event.target.value })}
              >
                {LEVEL_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button type="submit" variant="contained" disabled={pending} sx={{ alignSelf: 'flex-start' }}>
              Créer le cours
            </Button>
          </Stack>
        </CardContent>
      </Card>
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
        <Stack spacing={2}>
          {courses.map((course) => (
            <Card key={course.id} variant={course.id === selectedId ? 'elevation' : 'outlined'}>
              <CardContent>
                <Stack spacing={1}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Typography variant="h6" component="h2" sx={{ flexGrow: 1 }}>{course.title}</Typography>
                    <LevelChip level={course.level} />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {`${course.lessonCount} leçon${course.lessonCount > 1 ? 's' : ''}`}
                  </Typography>
                  <FormControlLabel
                    control={<Switch checked={course.published} onChange={() => togglePublished(course)} />}
                    label={course.published ? 'Publié' : 'Brouillon'}
                  />
                  <Stack direction="row" spacing={1}>
                    <Button variant="outlined" onClick={() => openCourse(course.id)}>Leçons</Button>
                    <Button color="error" onClick={() => setDeleteTarget(course)}>Supprimer</Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
          {courses.length === 0 && <Alert severity="info">Aucun cours pour le moment.</Alert>}
        </Stack>
        <Card>
          <CardContent>
            {selected ? (
              <Stack component="form" spacing={2} onSubmit={createLesson}>
                <Typography variant="h6" component="h2">Leçons — {selected.title}</Typography>
                {lessons.length === 0 && <Typography color="text.secondary">Aucune leçon.</Typography>}
                {lessons.map((lesson) => (
                  <Typography key={lesson.id}>
                    {lesson.order}. {lesson.title}{lesson.hasVideo ? '' : ' (sans vidéo)'}
                  </Typography>
                ))}
                <TextField
                  label="Titre de la leçon"
                  value={lessonForm.title}
                  onChange={(event) => setLessonForm({ ...lessonForm, title: event.target.value })}
                  required
                  fullWidth
                />
                <TextField
                  label="Ordre"
                  type="number"
                  value={lessonForm.order}
                  onChange={(event) => setLessonForm({ ...lessonForm, order: event.target.value })}
                  slotProps={{ htmlInput: { min: 1 } }}
                  fullWidth
                />
                <Button component="label" variant="outlined" sx={{ alignSelf: 'flex-start' }}>
                  {lessonForm.file ? lessonForm.file.name : 'Choisir une vidéo'}
                  <input
                    hidden
                    type="file"
                    accept="video/mp4,application/vnd.apple.mpegurl,.m3u8,.ts"
                    onChange={(event) => setLessonForm({ ...lessonForm, file: event.target.files?.[0] || null })}
                  />
                </Button>
                <Button type="submit" variant="contained" disabled={pending} sx={{ alignSelf: 'flex-start' }}>
                  Ajouter la leçon
                </Button>
              </Stack>
            ) : (
              <Typography color="text.secondary">Choisis un cours pour gérer ses leçons.</Typography>
            )}
          </CardContent>
        </Card>
      </Box>
      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Supprimer ce cours ?</DialogTitle>
        <DialogContent>
          <Typography>
            {deleteTarget ? `« ${deleteTarget.title} » et ses leçons seront retirés.` : ''}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Annuler</Button>
          <Button color="error" onClick={removeCourse}>Supprimer</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
