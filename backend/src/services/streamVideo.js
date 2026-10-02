import fs from 'node:fs';
import path from 'node:path';

const CONTENT_TYPES = {
  '.mp4': 'video/mp4',
  '.m3u8': 'application/vnd.apple.mpegurl',
  '.ts': 'video/mp2t',
};

export function resolveUpload(relativePath) {
  const root = path.resolve(process.env.UPLOAD_DIR || '/app/uploads');
  const target = path.resolve(root, relativePath);
  if (target !== root && !target.startsWith(`${root}${path.sep}`)) {
    const error = new Error('Chemin invalide');
    error.status = 400;
    throw error;
  }
  return target;
}

function contentTypeFor(filePath) {
  return CONTENT_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

export function streamFile(req, res, absolutePath) {
  const stat = fs.statSync(absolutePath);
  const fileSize = stat.size;
  const contentType = contentTypeFor(absolutePath);
  const range = req.headers.range;

  const baseHeaders = {
    'Content-Type': contentType,
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'private, no-store',
    'Content-Disposition': 'inline',
    'X-Content-Type-Options': 'nosniff',
  };

  if (!range) {
    res.writeHead(200, { ...baseHeaders, 'Content-Length': fileSize });
    const stream = fs.createReadStream(absolutePath);
    stream.on('error', () => res.destroy());
    stream.pipe(res);
    return;
  }

  const match = /^bytes=(\d*)-(\d*)$/.exec(range);
  if (!match) {
    res.status(416).set('Content-Range', `bytes */${fileSize}`).end();
    return;
  }

  const start = match[1] ? Number.parseInt(match[1], 10) : 0;
  let end = match[2] ? Number.parseInt(match[2], 10) : fileSize - 1;
  if (Number.isNaN(start) || Number.isNaN(end) || start > end || start >= fileSize) {
    res.status(416).set('Content-Range', `bytes */${fileSize}`).end();
    return;
  }

  end = Math.min(end, fileSize - 1);
  const stream = fs.createReadStream(absolutePath, { start, end });
  stream.on('error', () => res.destroy());
  res.writeHead(206, {
    ...baseHeaders,
    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
    'Content-Length': end - start + 1,
  });
  stream.pipe(res);
}
