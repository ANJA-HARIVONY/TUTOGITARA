import { Router } from 'express';
import User from '../models/User.js';
import UserProgress from '../models/UserProgress.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { buildProgressOverview, buildStudentProgress } from '../services/studentProgress.js';

const router = Router();
const ROLES = new Set(['student', 'admin']);

router.use(requireAuth, requireRole('admin'));

function presentUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

router.get('/', asyncHandler(async (req, res) => {
  const users = await User.find().sort({ name: 1 });
  res.json({ users: users.map(presentUser) });
}));

router.get('/progress', asyncHandler(async (req, res) => {
  res.json(await buildProgressOverview());
}));

router.post('/', asyncHandler(async (req, res) => {
  const name = req.body?.name?.trim();
  const email = req.body?.email?.trim();
  const password = req.body?.password;
  const role = req.body?.role;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Nom, e-mail et mot de passe sont requis' });
  }
  if (String(password).length < 8) {
    return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 8 caractères' });
  }
  if (!ROLES.has(role)) {
    return res.status(400).json({ message: 'Rôle invalide' });
  }

  const user = await User.create({ name, email, password, role });
  return res.status(201).json({ user: presentUser(user) });
}));

router.get('/:id/progress', asyncHandler(async (req, res) => {
  const student = await buildStudentProgress(req.params.id);
  if (!student) return res.status(404).json({ message: 'Utilisateur introuvable' });
  return res.json({ student });
}));

router.patch('/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('+password');
  if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });

  if (typeof req.body?.name === 'string') {
    const name = req.body.name.trim();
    if (!name) return res.status(400).json({ message: 'Le nom est requis' });
    user.name = name;
  }

  if (typeof req.body?.role === 'string' && req.body.role !== user.role) {
    if (!ROLES.has(req.body.role)) return res.status(400).json({ message: 'Rôle invalide' });
    if (req.user._id.equals(user._id)) {
      return res.status(400).json({ message: 'Impossible de modifier son propre rôle' });
    }
    if (user.role === 'admin') {
      const admins = await User.countDocuments({ role: 'admin' });
      if (admins <= 1) {
        return res.status(400).json({ message: 'Il doit rester au moins un administrateur' });
      }
    }
    user.role = req.body.role;
  }

  if (typeof req.body?.password === 'string' && req.body.password.length > 0) {
    if (req.body.password.length < 8) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 8 caractères' });
    }
    user.password = req.body.password;
  }

  await user.save();
  return res.json({ user: presentUser(user) });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
  if (req.user._id.equals(user._id)) {
    return res.status(400).json({ message: 'Impossible de supprimer son propre compte' });
  }
  if (user.role === 'admin') {
    const admins = await User.countDocuments({ role: 'admin' });
    if (admins <= 1) {
      return res.status(400).json({ message: 'Il doit rester au moins un administrateur' });
    }
  }

  await UserProgress.deleteMany({ user: user._id });
  await user.deleteOne();
  return res.status(204).end();
}));

export default router;
