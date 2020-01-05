import React from 'react';
import './App.scss';
import Header from './components/header/header';
import Footer from './components/footer/footer';
import Container from '@material-ui/core/Container';

const App: React.FC = () => {
  return (
    <div className="App">
      <Header />
      <main className="App-main">
        <Container maxWidth="md" className="App-container">
          Mika koten
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default App;
