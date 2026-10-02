import fs from 'node:fs';
import { Router } from 'express';
import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { resolveUpload, streamFile } from '../services/streamVideo.js';

const router = Router();

router.get('/:id/stream', requireAuth, asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id);
  if (!lesson?.videoFile) return res.status(404).json({ message: 'Vidéo introuvable' });

  const course = await Course.findById(lesson.course);
  if (!course) return res.status(404).json({ message: 'Cours introuvable' });
  if (!course.published && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Accès refusé' });
  }

  const absolutePath = resolveUpload(lesson.videoFile);
  if (!fs.existsSync(absolutePath)) return res.status(404).json({ message: 'Fichier vidéo absent' });

  streamFile(req, res, absolutePath);
  return undefined;
}));

export default router;
