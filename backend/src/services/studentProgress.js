import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import User from '../models/User.js';
import UserProgress from '../models/UserProgress.js';
import { coursePercent, lessonPercentValue } from './progressState.js';

function groupLessons(lessons) {
  const lessonsByCourse = new Map();
  for (const lesson of lessons) {
    const key = lesson.course.toString();
    const list = lessonsByCourse.get(key) || [];
    list.push(lesson);
    lessonsByCourse.set(key, list);
  }
  return lessonsByCourse;
}

function presentCourseProgress(course, lessons, progress, { withLessons }) {
  const lessonIds = lessons.map((lesson) => lesson._id);
  const completedIds = new Set((progress?.completedLessons || []).map((id) => id.toString()));
  const lastLessonId = progress?.lastLesson ? progress.lastLesson.toString() : null;
  const lastLesson = lessons.find((lesson) => lesson._id.toString() === lastLessonId);

  const row = {
    courseId: course._id.toString(),
    title: course.title,
    level: course.level,
    published: course.published,
    lessonCount: lessons.length,
    completedCount: lessonIds.filter((id) => completedIds.has(id.toString())).length,
    percent: coursePercent(lessonIds, progress),
    lastLessonTitle: lastLesson?.title || null,
    updatedAt: progress?.updatedAt || null,
  };

  if (withLessons) {
    row.lessons = lessons.map((lesson) => ({
      id: lesson._id.toString(),
      title: lesson.title,
      order: lesson.order,
      percent: lessonPercentValue(progress, lesson._id),
    }));
  }

  return row;
}

function activityTime(value) {
  return value ? new Date(value).getTime() : 0;
}

function sortCourses(rows) {
  return [...rows].sort((a, b) => {
    const aStarted = Boolean(a.updatedAt);
    const bStarted = Boolean(b.updatedAt);
    if (aStarted !== bStarted) return aStarted ? -1 : 1;
    if (a.updatedAt && b.updatedAt) return activityTime(b.updatedAt) - activityTime(a.updatedAt);
    return a.title.localeCompare(b.title, 'fr');
  });
}

function presentStudent(student, courses, lessonsByCourse, progresses, { withLessons }) {
  const own = progresses.filter((row) => row.user.equals(student._id));
  const byCourse = new Map(own.map((row) => [row.course.toString(), row]));
  const courseRows = sortCourses(courses.map((course) => presentCourseProgress(
    course,
    lessonsByCourse.get(course._id.toString()) || [],
    byCourse.get(course._id.toString()),
    { withLessons },
  )));
  const started = courseRows.filter((row) => row.updatedAt);
  const averagePercent = started.length
    ? Math.round(started.reduce((sum, row) => sum + row.percent, 0) / started.length)
    : 0;
  const lastActivityAt = started.reduce((latest, row) => (
    activityTime(row.updatedAt) > activityTime(latest) ? row.updatedAt : latest
  ), null);

  return {
    id: student._id.toString(),
    name: student.name,
    email: student.email,
    coursesStarted: started.length,
    averagePercent,
    lastActivityAt,
    courses: withLessons ? courseRows : started,
  };
}

async function loadCatalog() {
  const [courses, lessons] = await Promise.all([
    Course.find().sort({ title: 1 }),
    Lesson.find().select('course title order').sort({ order: 1, title: 1 }),
  ]);
  return { courses, lessonsByCourse: groupLessons(lessons) };
}

export async function buildProgressOverview() {
  const students = await User.find({ role: 'student' }).sort({ name: 1 });
  const [{ courses, lessonsByCourse }, progresses] = await Promise.all([
    loadCatalog(),
    UserProgress.find(),
  ]);

  const rows = students.map((student) => presentStudent(
    student,
    courses,
    lessonsByCourse,
    progresses,
    { withLessons: false },
  ));

  rows.sort((a, b) => {
    const byActivity = activityTime(b.lastActivityAt) - activityTime(a.lastActivityAt);
    if (byActivity !== 0) return byActivity;
    return a.name.localeCompare(b.name, 'fr');
  });

  return {
    courses: courses.map((course) => ({
      id: course._id.toString(),
      title: course.title,
      level: course.level,
      published: course.published,
      lessonCount: (lessonsByCourse.get(course._id.toString()) || []).length,
    })),
    students: rows,
  };
}

export async function buildStudentProgress(userId) {
  const student = await User.findById(userId);
  if (!student) return null;

  const [{ courses, lessonsByCourse }, progresses] = await Promise.all([
    loadCatalog(),
    UserProgress.find({ user: student._id }),
  ]);

  return presentStudent(student, courses, lessonsByCourse, progresses, { withLessons: true });
}
