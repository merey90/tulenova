import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';

import './App.scss';

import Header from './components/header/header';
import Routes, { Home, IRoute } from './components/header/routes';

const App: React.FC = () => {
  const renderRoutes = (route: IRoute) => (
    <Route
      key={route.url}
      path={route.url}
      children={route.component}
      exact={route.exact}
    />
  );

  return (
    <div className="App">
      <Header />
      <main className="App-main">
        <Switch>
          {Routes.map(renderRoutes)}
          <Redirect to={Home.url} />
        </Switch>
      </main>
    </div>
  );
};

export default App;
