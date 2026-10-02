import Chip from '@mui/material/Chip';
import { levelLabel } from '../levels';

export default function LevelChip({ level }) {
  return <Chip size="small" color="secondary" variant="outlined" label={levelLabel(level)} />;
}
