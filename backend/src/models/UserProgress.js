import mongoose from 'mongoose';

const lessonProgressSchema = new mongoose.Schema(
  {
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
    percent: { type: Number, min: 0, max: 100, required: true },
  },
  { _id: false },
);

const userProgressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
    lessonProgress: { type: [lessonProgressSchema], default: [] },
    lastLesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', default: null },
  },
  { timestamps: true },
);

userProgressSchema.index({ user: 1, course: 1 }, { unique: true });

export default mongoose.model('UserProgress', userProgressSchema);
