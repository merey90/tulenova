import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import CssBaseline from '@material-ui/core/CssBaseline';
import { responsiveFontSizes, createTheme, ThemeProvider } from '@material-ui/core/styles';

import reportWebVitals from './reportWebVitals';
import Firebase from './firebase';
import { App } from './components/app';

let theme = createTheme({
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

Firebase.init();

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ThemeProvider>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
