import { Link as RouterLink, useLocation } from 'react-router-dom';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

const LINKS = [
  { to: '/admin', label: 'Cours' },
  { to: '/admin/utilisateurs', label: 'Élèves' },
  { to: '/admin/suivi', label: 'Suivi' },
];

function currentTab(pathname) {
  if (pathname.startsWith('/admin/suivi')) return '/admin/suivi';
  if (pathname.startsWith('/admin/utilisateurs')) return '/admin/utilisateurs';
  return '/admin';
}

export default function AdminNav() {
  const { pathname } = useLocation();
  const value = currentTab(pathname);

  return (
    <Tabs value={value}>
      {LINKS.map((link) => (
        <Tab key={link.to} label={link.label} value={link.to} component={RouterLink} to={link.to} />
      ))}
    </Tabs>
  );
}
