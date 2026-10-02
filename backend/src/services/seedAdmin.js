import User from '../models/User.js';

export async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 8) return;

  const existing = await User.findOne({ email });
  if (existing) return;

  await User.create({
    name: 'Administrateur',
    email,
    password,
    role: 'admin',
  });
  console.log(`Compte admin créé : ${email}`);
}
