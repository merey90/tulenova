import { Routes } from 'react-router-dom';

import Header from '../header/header';
import { MyRoutes } from '../routing/routes';
import Routing from '../routing/routing';

import './App.scss';

export const App: React.FC = () => (
  <div className="App">
    <Header />
    <main className="App-main">
      <Routes>{MyRoutes.map(Routing)}</Routes>
    </main>
  </div>
);
