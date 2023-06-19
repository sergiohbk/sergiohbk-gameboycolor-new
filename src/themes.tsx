import { createTheme } from '@mui/material';

export const baseTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6684d0',
    },
    secondary: {
      main: '#03DAC6',
    },
    background: {
      default: '#000000',
      paper: '#121414',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#A1A1A1',
    },
  },
});
