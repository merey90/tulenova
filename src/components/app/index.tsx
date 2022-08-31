// import { Routes } from 'react-router-dom';
// import { Alert } from '@material-ui/lab';

// import Header from '../header/header';
// import { MyRoutes } from '../routing/routes';
// import Routing from '../routing/routing';

import './App.scss';
import { Construction } from '../construction';

export const App: React.FC = () => (
  <div className="App">
    {/* <Header />
    <Alert className="alert-box" severity="warning">
      This site is under construction
    </Alert>
    <main className="App-main">
      <Routes>{MyRoutes.map(Routing)}</Routes>
    </main> */}
    <Construction />
  </div>
);
