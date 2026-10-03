import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import LinearProgress from '@mui/material/LinearProgress';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { api } from '../../api';

function formatActivity(value) {
  if (!value) return 'Aucune activité';
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function courseRow(student, courseId) {
  return student.courses.find((course) => course.courseId === courseId) || null;
}

export default function ProgressPage() {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [courseId, setCourseId] = useState('tous');
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api.studentProgress()
      .then((data) => {
        if (!active) return;
        setCourses(data.courses);
        setStudents(data.students);
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

  const selectedCourse = courses.find((course) => course.id === courseId) || null;
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return students.filter((student) => {
      const matchesQuery = !needle
        || student.name.toLowerCase().includes(needle)
        || student.email.toLowerCase().includes(needle);
      return matchesQuery;
    });
  }, [students, query]);

  const activeCount = students.filter((student) => student.coursesStarted > 0).length;

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" component="h1">Suivi des élèves</Typography>
        <Typography color="text.secondary">
          Avancement de chaque élève, parcours par parcours.
        </Typography>
      </Box>
      {loading && <LinearProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && (
        <Typography variant="body2" color="text.secondary">
          {`${students.length} élève${students.length > 1 ? 's' : ''} · ${activeCount} ont commencé un parcours`}
        </Typography>
      )}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          label="Rechercher un élève"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          fullWidth
        />
        <FormControl fullWidth>
          <InputLabel id="progress-course">Parcours</InputLabel>
          <Select
            labelId="progress-course"
            label="Parcours"
            value={courseId}
            onChange={(event) => setCourseId(event.target.value)}
          >
            <MenuItem value="tous">Tous les parcours</MenuItem>
            {courses.map((course) => (
              <MenuItem key={course.id} value={course.id}>{course.title}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
      {!loading && students.length === 0 && (
        <Alert severity="info">Aucun élève pour le moment.</Alert>
      )}
      {students.length > 0 && (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Élève</TableCell>
                <TableCell>{selectedCourse ? 'Leçons' : 'Parcours commencés'}</TableCell>
                <TableCell sx={{ minWidth: 180 }}>Avancement</TableCell>
                <TableCell>Dernière activité</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {visible.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography color="text.secondary">Aucun élève ne correspond.</Typography>
                  </TableCell>
                </TableRow>
              )}
              {visible.map((student) => {
                const focused = selectedCourse ? courseRow(student, selectedCourse.id) : null;
                const percent = selectedCourse ? (focused?.percent || 0) : student.averagePercent;
                const lessonCount = focused?.lessonCount ?? selectedCourse?.lessonCount ?? 0;
                const completedCount = focused?.completedCount || 0;
                return (
                  <TableRow key={student.id} hover>
                    <TableCell>
                      <Typography>{student.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{student.email}</Typography>
                    </TableCell>
                    <TableCell>
                      {selectedCourse ? `${completedCount}/${lessonCount}` : student.coursesStarted}
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.75}>
                        <Typography variant="body2">{percent} %</Typography>
                        <LinearProgress
                          variant="determinate"
                          value={percent}
                          aria-label={`Avancement de ${student.name}`}
                        />
                      </Stack>
                    </TableCell>
                    <TableCell>
                      {formatActivity(selectedCourse ? focused?.updatedAt : student.lastActivityAt)}
                    </TableCell>
                    <TableCell align="right">
                      <Button component={RouterLink} to={`/admin/suivi/${student.id}`} variant="outlined">
                        Détail
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Stack>
  );
}
