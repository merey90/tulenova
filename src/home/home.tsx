import { Typography } from '@material-ui/core';
import FacebookIcon from '@material-ui/icons/Facebook';
import InstagramIcon from '@material-ui/icons/Instagram';
import TwitterIcon from '@material-ui/icons/Twitter';
import { Link } from 'react-router-dom';
import { SculptureInstallation } from './sculptureInstallation';
import './home.scss';

const disciplines = [
  {
    title: 'Music & Performance',
    description: 'Concerts, premieres & live works',
    path: '/concerts',
  },
  {
    title: 'Media',
    description: 'Photos, video & audio',
    path: '/media/photos',
  },
  {
    title: 'Research & Projects',
    description: 'Cultural work & curation',
    path: '/projects',
  },
  {
    title: 'About',
    description: 'Biography & background',
    path: '/about',
  },
];

export const Home: React.FC = () => (
  <div className="home-container">
    <SculptureInstallation />
    <div className="home-overlay" aria-hidden="true" />

    <div className="home-content">
      <header className="home-hero">
        <Typography className="home-role" variant="overline">
          Multimedia Artist
        </Typography>
        <Typography className="home-title" variant="h2">
          Mira Tulenova
        </Typography>
        <Typography className="home-tagline" variant="body1">
          Flutist · Performer · Curator · Cultural Researcher
        </Typography>
        <Typography className="home-sound-hint" variant="caption">
          Touch the space to awaken sound
        </Typography>
      </header>

      <nav className="home-disciplines" aria-label="Explore work">
        {disciplines.map(({ title, description, path }) => (
          <Link key={title} to={path} className="home-discipline-card">
            <span className="home-discipline-title">{title}</span>
            <span className="home-discipline-description">{description}</span>
          </Link>
        ))}
      </nav>

      <footer className="home-footer">
        <div className="home-social">
          <a className="social-link" href="https://www.facebook.com/mira.tulenova" target="_blank" rel="noreferrer">
            <FacebookIcon fontSize="small" />
          </a>
          <a className="social-link" href="https://www.instagram.com/mira_tulenova/" target="_blank" rel="noreferrer">
            <InstagramIcon fontSize="small" />
          </a>
          <a className="social-link" href="https://mobile.twitter.com/miratulenova" target="_blank" rel="noreferrer">
            <TwitterIcon fontSize="small" />
          </a>
        </div>
        <Link to="/contact" className="home-contact-link">
          Contact
        </Link>
      </footer>
    </div>
  </div>
);

export default Home;
