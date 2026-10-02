import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';

const ALLOWED = new Set(['.mp4', '.m3u8', '.ts']);

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const dir = path.join(process.env.UPLOAD_DIR || '/app/uploads', 'videos');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED.has(ext)) {
    const error = new Error('Format accepté : MP4 ou HLS (.m3u8, .ts)');
    error.status = 400;
    cb(error);
    return;
  }
  cb(null, true);
}

export const uploadVideo = multer({
  storage,
  fileFilter,
  limits: { fileSize: 512 * 1024 * 1024 },
});
