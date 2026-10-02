import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    level: {
      type: String,
      enum: ['debutant', 'intermediaire', 'avance'],
      default: 'debutant',
    },
    published: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model('Course', courseSchema);
