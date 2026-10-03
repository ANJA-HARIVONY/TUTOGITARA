import { Link as RouterLink } from 'react-router-dom';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

export default function PageBreadcrumbs({ items }) {
  return (
    <Breadcrumbs aria-label="Fil d'Ariane">
      {items.map((item, index) => {
        const last = index === items.length - 1;
        if (last || !item.to) {
          return (
            <Typography key={`${item.label}-${index}`} color="text.primary">
              {item.label}
            </Typography>
          );
        }
        return (
          <Link
            key={`${item.to}-${index}`}
            component={RouterLink}
            to={item.to}
            underline="hover"
            color="inherit"
          >
            {item.label}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
}
