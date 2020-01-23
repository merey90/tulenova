import React from 'react';
import { Switch, Redirect } from 'react-router-dom';

import './App.scss';

import Header from './components/header/header';
import Routes, { Home } from './components/routing/routes';
import Routing from './components/routing/routing';

const App: React.FC = () => {
  return (
    <div className="App">
      <Header />
      <main className="App-main">
        <Switch>
          {Routes.map(Routing)}
          <Redirect to={Home.path} />
        </Switch>
      </main>
    </div>
  );
};

export default App;
