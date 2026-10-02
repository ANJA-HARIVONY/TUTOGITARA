export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err.name === 'ValidationError') {
    res.status(400).json({ message: 'Données invalides' });
    return;
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0];
    const message = field === 'email' ? 'Cet e-mail est déjà utilisé' : 'Cette valeur existe déjà';
    res.status(409).json({ message });
    return;
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    res.status(400).json({ message: 'La vidéo dépasse 512 Mo' });
    return;
  }

  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ message: err.status ? err.message : 'Erreur serveur' });
}
