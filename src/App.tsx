import React from 'react';
import { Routes } from 'react-router-dom';

import './App.scss';

import Header from './components/header/header';
import { MyRoutes } from './components/routing/routes';
import Routing from './components/routing/routing';

const App: React.FC = () => (
  <div className="App">
    <Header />
    <main className="App-main">
      <Routes>{MyRoutes.map(Routing)}</Routes>
    </main>
  </div>
);

export default App;
