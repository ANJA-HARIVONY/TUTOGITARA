import { Router } from 'express';
import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import UserProgress from '../models/UserProgress.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';

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

  const progress = await UserProgress.findOneAndUpdate(
    { user: req.user._id, course: owned.course._id },
    { $set: { lastLesson: owned.lesson._id }, $setOnInsert: { completedLessons: [] } },
    { upsert: true, new: true },
  );

  return res.json({
    progress: {
      completedLessonIds: progress.completedLessons.map((id) => id.toString()),
      lastLessonId: progress.lastLesson ? progress.lastLesson.toString() : null,
    },
  });
}));

router.post('/:courseId/lessons/:lessonId/complete', asyncHandler(async (req, res) => {
  const owned = await loadOwnedLesson(req, res);
  if (!owned) return undefined;

  const progress = await UserProgress.findOneAndUpdate(
    { user: req.user._id, course: owned.course._id },
    {
      $set: { lastLesson: owned.lesson._id },
      $addToSet: { completedLessons: owned.lesson._id },
    },
    { upsert: true, new: true },
  );

  return res.json({
    progress: {
      completedLessonIds: progress.completedLessons.map((id) => id.toString()),
      lastLessonId: progress.lastLesson ? progress.lastLesson.toString() : null,
    },
  });
}));

export default router;
