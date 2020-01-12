import React from 'react';
import './App.scss';
import Header from './components/header/header';
import { Route } from 'react-router-dom';
import Home from './home/home';
import Bio from './bio/bio';

const App: React.FC = () => {
  return (
    <div className="App">
      <Header />
      <main className="App-main">
        <Route path="/bio">
          <Bio />
        </Route>
        <Route exact path="/">
          <Home />
        </Route>
      </main>
    </div>
  );
};

export default App;
