import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function readToken(req) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7).trim();
  return typeof req.query.token === 'string' ? req.query.token : '';
}

export async function requireAuth(req, res, next) {
  const token = readToken(req);
  if (!token) return res.status(401).json({ message: 'Authentification requise' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ message: 'Session invalide' });
    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ message: 'Session invalide' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès refusé' });
    }
    return next();
  };
}
