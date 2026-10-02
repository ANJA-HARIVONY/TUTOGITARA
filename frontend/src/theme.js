import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6F4E37',
      contrastText: '#FFF8F0',
    },
    secondary: {
      main: '#C4622D',
    },
    background: {
      default: '#F7F1E8',
      paper: '#FFFCF8',
    },
    text: {
      primary: '#2A2118',
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: '"Avenir Next", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600 },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0 },
    },
  },
});

export default theme;
