import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MusicNoteIcon from '@mui/icons-material/MusicNote';

export default function AuthCard({ title, subtitle, children, footer }) {
  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', px: 2, py: 4 }}>
      <Card sx={{ width: '100%', maxWidth: 440 }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack spacing={1} sx={{ mb: 3, alignItems: 'center' }}>
            <MusicNoteIcon color="primary" sx={{ fontSize: 42 }} />
            <Typography variant="h5" component="h1">{title}</Typography>
            <Typography color="text.secondary" textAlign="center">{subtitle}</Typography>
          </Stack>
          {children}
          {footer && <Box sx={{ mt: 2 }}>{footer}</Box>}
        </CardContent>
      </Card>
    </Box>
  );
}
