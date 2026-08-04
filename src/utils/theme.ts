import { createTheme, responsiveFontSizes } from '@material-ui/core';

let theme = createTheme({
  typography: {
    fontFamily: 'DINNext, Roboto',
  },
  palette: {
    primary: {
      light: '#9a9188',
      main: '#5c564f',
      dark: '#4a4540',
      contrastText: '#f8f5f0',
    },
    secondary: {
      main: '#b8aea4',
      light: '#e8e2d9',
      dark: '#9a9188',
      contrastText: '#4a4540',
    },
    background: {
      default: '#f8f5f0',
      paper: '#f3efe8',
    },
    text: {
      primary: '#5c564f',
      secondary: '#9a9188',
    },
  },
});

theme = responsiveFontSizes(theme);

export { theme };
