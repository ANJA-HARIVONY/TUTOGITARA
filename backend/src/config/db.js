import mongoose from 'mongoose';

export async function connectDb() {
  mongoose.set('strictQuery', true);
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/guitare';

  for (let attempt = 1; attempt <= 20; attempt += 1) {
    try {
      await mongoose.connect(uri);
      return;
    } catch (error) {
      if (attempt === 20) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }
}
