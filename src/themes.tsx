import { createTheme } from '@mui/material';

declare module '@mui/material/styles' {
  interface Theme {
    TablePalette: {
      odd: string;
      even: string;
      header: string;
    };
  }
  interface ThemeOptions {
    TablePalette?: {
      odd?: string;
      even?: string;
      header?: string;
    };
  }
}

export const baseTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6684d0',
      light: '#a3b9ff',
      dark: '#3351a6',
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
  TablePalette: {
    odd: '#2e2f3a',
    even: '#343440',
    header: '#26282e',
  },
});
