import fs from 'node:fs/promises';
import path from 'node:path';
import { Router } from 'express';
import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import UserProgress from '../models/UserProgress.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { uploadVideo } from '../middleware/upload.js';
import { resolveUpload } from '../services/streamVideo.js';

const router = Router();
const LEVELS = new Set(['debutant', 'intermediaire', 'avance']);

function presentCourse(course, extra = {}) {
  return {
    id: course._id.toString(),
    title: course.title,
    description: course.description,
    level: course.level,
    published: course.published,
    createdAt: course.createdAt,
    ...extra,
  };
}

function presentLesson(lesson) {
  return {
    id: lesson._id.toString(),
    title: lesson.title,
    order: lesson.order,
    hasVideo: Boolean(lesson.videoFile),
  };
}

function presentProgress(progress) {
  if (!progress) return { completedLessonIds: [], lastLessonId: null };
  return {
    completedLessonIds: progress.completedLessons.map((id) => id.toString()),
    lastLessonId: progress.lastLesson ? progress.lastLesson.toString() : null,
  };
}

router.use(requireAuth);

router.get('/', asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { published: true };
  const courses = await Course.find(filter).sort({ createdAt: -1 });
  const courseIds = courses.map((course) => course._id);

  const [lessonCounts, progresses] = await Promise.all([
    Lesson.aggregate([
      { $match: { course: { $in: courseIds } } },
      { $group: { _id: '$course', count: { $sum: 1 } } },
    ]),
    UserProgress.find({ user: req.user._id, course: { $in: courseIds } }),
  ]);

  const lessonsByCourse = new Map(lessonCounts.map((row) => [row._id.toString(), row.count]));
  const progressByCourse = new Map(progresses.map((row) => [row.course.toString(), row]));

  res.json({
    courses: courses.map((course) => {
      const progress = progressByCourse.get(course._id.toString());
      return presentCourse(course, {
        lessonCount: lessonsByCourse.get(course._id.toString()) || 0,
        completedCount: progress ? progress.completedLessons.length : 0,
      });
    }),
  });
}));

router.post('/', requireRole('admin'), asyncHandler(async (req, res) => {
  const title = req.body?.title?.trim();
  const description = req.body?.description?.trim() || '';
  const level = req.body?.level || 'debutant';

  if (!title) return res.status(400).json({ message: 'Le titre est requis' });
  if (!LEVELS.has(level)) return res.status(400).json({ message: 'Niveau invalide' });

  const course = await Course.create({ title, description, level, published: false });
  return res.status(201).json({ course: presentCourse(course, { lessonCount: 0, completedCount: 0 }) });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ message: 'Cours introuvable' });
  if (!course.published && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Accès refusé' });
  }

  const [lessons, progress] = await Promise.all([
    Lesson.find({ course: course._id }).sort({ order: 1, title: 1 }),
    UserProgress.findOne({ user: req.user._id, course: course._id }),
  ]);

  return res.json({
    course: presentCourse(course, {
      lessonCount: lessons.length,
      completedCount: progress ? progress.completedLessons.length : 0,
    }),
    lessons: lessons.map(presentLesson),
    progress: presentProgress(progress),
  });
}));

router.patch('/:id', requireRole('admin'), asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ message: 'Cours introuvable' });

  if (typeof req.body?.title === 'string') {
    const title = req.body.title.trim();
    if (!title) return res.status(400).json({ message: 'Le titre est requis' });
    course.title = title;
  }
  if (typeof req.body?.description === 'string') course.description = req.body.description.trim();
  if (typeof req.body?.level === 'string') {
    if (!LEVELS.has(req.body.level)) return res.status(400).json({ message: 'Niveau invalide' });
    course.level = req.body.level;
  }
  if (typeof req.body?.published === 'boolean') course.published = req.body.published;

  await course.save();
  const lessonCount = await Lesson.countDocuments({ course: course._id });
  return res.json({ course: presentCourse(course, { lessonCount, completedCount: 0 }) });
}));

router.delete('/:id', requireRole('admin'), asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ message: 'Cours introuvable' });

  const lessons = await Lesson.find({ course: course._id });
  await Promise.all(lessons.map(async (lesson) => {
    if (!lesson.videoFile) return;
    await fs.unlink(resolveUpload(lesson.videoFile)).catch(() => {});
  }));

  await Lesson.deleteMany({ course: course._id });
  await UserProgress.deleteMany({ course: course._id });
  await course.deleteOne();
  return res.status(204).end();
}));

router.post('/:id/lessons', requireRole('admin'), uploadVideo.single('video'), asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    return res.status(404).json({ message: 'Cours introuvable' });
  }

  const title = req.body?.title?.trim();
  if (!title) {
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    return res.status(400).json({ message: 'Le titre de la leçon est requis' });
  }

  const requestedOrder = Number.parseInt(req.body?.order, 10);
  const order = Number.isInteger(requestedOrder) && requestedOrder > 0
    ? requestedOrder
    : (await Lesson.countDocuments({ course: course._id })) + 1;

  const videoFile = req.file
    ? path.posix.join('videos', path.basename(req.file.filename))
    : '';

  const lesson = await Lesson.create({ course: course._id, title, order, videoFile });
  return res.status(201).json({ lesson: presentLesson(lesson) });
}));

export default router;
