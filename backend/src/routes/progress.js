import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { presentProgress, recordLessonPercent } from '../services/progressState.js';
import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';

const router = Router();

router.use(requireAuth);

async function loadOwnedLesson(req, res) {
  const course = await Course.findById(req.params.courseId);
  if (!course) {
    res.status(404).json({ message: 'Cours introuvable' });
    return null;
  }
  if (!course.published && req.user.role !== 'admin') {
    res.status(403).json({ message: 'Accès refusé' });
    return null;
  }

  const lesson = await Lesson.findOne({ _id: req.params.lessonId, course: course._id });
  if (!lesson) {
    res.status(404).json({ message: 'Leçon introuvable' });
    return null;
  }

  return { course, lesson };
}

router.post('/:courseId/lessons/:lessonId/visit', asyncHandler(async (req, res) => {
  const owned = await loadOwnedLesson(req, res);
  if (!owned) return undefined;

  const progress = await recordLessonPercent(req.user._id, owned.course._id, owned.lesson._id, 0);
  return res.json({ progress: presentProgress(progress) });
}));

router.post('/:courseId/lessons/:lessonId/progress', asyncHandler(async (req, res) => {
  const owned = await loadOwnedLesson(req, res);
  if (!owned) return undefined;

  const progress = await recordLessonPercent(
    req.user._id,
    owned.course._id,
    owned.lesson._id,
    req.body?.percent,
  );
  return res.json({ progress: presentProgress(progress) });
}));

router.post('/:courseId/lessons/:lessonId/complete', asyncHandler(async (req, res) => {
  const owned = await loadOwnedLesson(req, res);
  if (!owned) return undefined;

  const progress = await recordLessonPercent(req.user._id, owned.course._id, owned.lesson._id, 100);
  return res.json({ progress: presentProgress(progress) });
}));

export default router;
