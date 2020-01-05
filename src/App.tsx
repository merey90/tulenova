import React from 'react';
import './App.scss';
import Header from './components/header/header';
import Footer from './components/footer/footer';

const App: React.FC = () => {
  return (
    <div className="App">
      <Header />
      <main>Mika koten</main>
      <Footer />
    </div>
  );
};

export default App;
