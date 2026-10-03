import UserProgress from '../models/UserProgress.js';

export function presentProgress(progress) {
  if (!progress) {
    return { completedLessonIds: [], lastLessonId: null, lessonPercents: [] };
  }

  return {
    completedLessonIds: progress.completedLessons.map((id) => id.toString()),
    lastLessonId: progress.lastLesson ? progress.lastLesson.toString() : null,
    lessonPercents: (progress.lessonProgress || []).map((item) => ({
      lessonId: item.lesson.toString(),
      percent: item.percent,
    })),
  };
}

export function lessonPercentValue(progress, lessonId) {
  const id = lessonId.toString();
  if (!progress) return 0;
  if (progress.completedLessons.some((item) => item.toString() === id)) return 100;
  const entry = (progress.lessonProgress || []).find((item) => item.lesson.toString() === id);
  return entry ? entry.percent : 0;
}

export function coursePercent(lessonIds, progress) {
  if (!lessonIds.length) return 0;
  const total = lessonIds.reduce((sum, lessonId) => sum + lessonPercentValue(progress, lessonId), 0);
  return Math.round(total / lessonIds.length);
}

export function resumeLessonId(lessonIds, progress) {
  if (!lessonIds.length) return null;
  const ids = lessonIds.map((id) => id.toString());
  const lastId = progress?.lastLesson ? progress.lastLesson.toString() : null;
  if (lastId && ids.includes(lastId) && lessonPercentValue(progress, lastId) < 100) return lastId;
  const unfinished = ids.find((id) => lessonPercentValue(progress, id) < 100);
  if (unfinished) return unfinished;
  if (lastId && ids.includes(lastId)) return lastId;
  return ids[0];
}

export async function recordLessonPercent(userId, courseId, lessonId, percent) {
  const requested = Math.round(Number(percent));
  if (!Number.isFinite(requested)) {
    const error = new Error('Pourcentage invalide');
    error.status = 400;
    throw error;
  }
  const nextPercent = Math.max(0, Math.min(100, requested));

  let progress = await UserProgress.findOne({ user: userId, course: courseId });
  if (!progress) {
    progress = new UserProgress({
      user: userId,
      course: courseId,
      completedLessons: [],
      lessonProgress: [],
    });
  }

  if (!progress.lessonProgress) progress.lessonProgress = [];
  progress.lastLesson = lessonId;
  const alreadyDone = progress.completedLessons.some((id) => id.equals(lessonId));
  const entry = progress.lessonProgress.find((item) => item.lesson.equals(lessonId));
  const stored = Math.max(entry ? entry.percent : 0, nextPercent, alreadyDone ? 100 : 0);
  if (entry) entry.percent = stored;
  else progress.lessonProgress.push({ lesson: lessonId, percent: stored });

  if (stored >= 100 && !progress.completedLessons.some((id) => id.equals(lessonId))) {
    progress.completedLessons.push(lessonId);
  }

  await progress.save();
  return progress;
}
