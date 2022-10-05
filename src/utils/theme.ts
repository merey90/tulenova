import { createTheme, responsiveFontSizes } from '@material-ui/core';

let theme = createTheme({
  typography: {
    fontFamily: 'DINNext, Roboto',
  },
  palette: {
    primary: {
      light: '#6d6d6d',
      main: '#000',
      dark: '#1b1b1b',
      contrastText: '#fff',
    },
    secondary: {
      main: '#a3956d',
      contrastText: '#000',
    },
  },
});

theme = responsiveFontSizes(theme);

export { theme };
