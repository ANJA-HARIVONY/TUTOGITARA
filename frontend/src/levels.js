const LABELS = {
  debutant: 'Débutant',
  intermediaire: 'Intermédiaire',
  avance: 'Avancé',
};

export const LEVEL_OPTIONS = Object.entries(LABELS).map(([value, label]) => ({ value, label }));

export function levelLabel(level) {
  return LABELS[level] || level;
}
