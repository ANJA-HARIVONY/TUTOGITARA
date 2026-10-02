import { Router } from 'express';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth, signToken } from '../middleware/auth.js';

const router = Router();

router.post('/register', asyncHandler(async (req, res) => {
  const name = req.body?.name?.trim();
  const email = req.body?.email?.trim();
  const password = req.body?.password;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Nom, e-mail et mot de passe sont requis' });
  }
  if (String(password).length < 8) {
    return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 8 caractères' });
  }

  const user = await User.create({ name, email, password, role: 'student' });
  return res.status(201).json({ token: signToken(user), user: user.toSafeJSON() });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = req.body?.password || '';
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'E-mail ou mot de passe incorrect' });
  }

  return res.json({ token: signToken(user), user: user.toSafeJSON() });
}));

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user.toSafeJSON() });
});

export default router;
