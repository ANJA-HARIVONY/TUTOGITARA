import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    title: { type: String, required: true, trim: true },
    order: { type: Number, required: true, min: 1 },
    videoFile: { type: String, default: '' },
  },
  { timestamps: true },
);

lessonSchema.index({ course: 1, order: 1 });

export default mongoose.model('Lesson', lessonSchema);
