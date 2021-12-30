import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import CssBaseline from '@material-ui/core/CssBaseline';
import {
  createTheme,
  responsiveFontSizes,
  ThemeProvider,
} from '@material-ui/core/styles';

import App from './App';
import reportWebVitals from './reportWebVitals';
import Firebase from './firebase';

import './index.scss';

Firebase.init();

let theme = createTheme({
  palette: {
    primary: {
      light: '#6d6d6d',
      main: '#000',
      dark: '#1b1b1b',
      contrastText: '#fff',
    },
    secondary: {
      light: '#ffddc1',
      main: '#ffab91',
      dark: '#c97b63',
      contrastText: '#000',
    },
  },
});

theme = responsiveFontSizes(theme);

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
