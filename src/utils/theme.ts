import { createTheme, responsiveFontSizes } from '@material-ui/core';

let theme = createTheme({
  typography: {
    fontFamily: 'DINNext, Roboto',
  },
  palette: {
    primary: {
      light: '#35383b',
      main: '#26292b',
      dark: '#1a1c1e',
      contrastText: '#b0fc59',
    },
    secondary: {
      main: '#b0fc59',
      light: '#c9ff82',
      dark: '#8fd945',
      contrastText: '#26292b',
    },
    background: {
      default: '#35383b',
      paper: '#26292b',
    },
    text: {
      primary: '#b0fc59',
      secondary: 'rgba(176, 252, 89, 0.72)',
    },
  },
});

theme = responsiveFontSizes(theme);

export { theme };
