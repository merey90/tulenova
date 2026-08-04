import { Typography } from '@material-ui/core';
import FacebookIcon from '@material-ui/icons/Facebook';
import InstagramIcon from '@material-ui/icons/Instagram';
import TwitterIcon from '@material-ui/icons/Twitter';
import { Link } from 'react-router-dom';
import { InstallationNav } from './installationNav';
import { HomeComposition } from './homeComposition';
import { SculptureInstallation } from './sculptureInstallation';
import './home.scss';

export const Home: React.FC = () => (
  <div className="home-container">
    <SculptureInstallation />
    <HomeComposition />

    <div className="home-content">
      <div className="home-museum-header">
        <div className="home-museum-identity">
          <span className="home-museum-mark" aria-hidden="true" />
          <Typography className="home-name" variant="h2" component="div">
            Mira Tulenova
          </Typography>
          <Typography className="home-roles" variant="body1">
            Interdisciplinary Artist · Curator · Cultural Researcher
          </Typography>
        </div>
        <span className="home-museum-divider" aria-hidden="true" />
        <InstallationNav variant="header" />
      </div>

      <div className="home-stage">
        <div className="home-copy">
          <header className="home-plaque">
            <p className="home-plaque-eyebrow">Sound installation</p>
            <Typography className="home-title" variant="h2" component="h1">
              Golden Ratio Progression
            </Typography>
            <Typography className="home-plaque-lead" component="p">
              An immersive sound field built from contrabass flute samples. Each point in the constellation carries its
              own pitch, woven with layered resonance and spatial motion.
            </Typography>
            <Typography className="home-sound-hint" variant="caption" component="p">
              <span className="home-sound-pulse" aria-hidden="true" />
              Move through the canvas to explore sound
            </Typography>
          </header>
        </div>
      </div>

      <footer className="home-footer">
        <div className="home-footer-left">
          <div className="home-social">
            <a
              className="social-link"
              href="https://www.facebook.com/mira.tulenova"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
            >
              <FacebookIcon fontSize="small" />
            </a>
            <a
              className="social-link"
              href="https://www.instagram.com/mira_tulenova/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
            >
              <InstagramIcon fontSize="small" />
            </a>
            <a
              className="social-link"
              href="https://mobile.twitter.com/miratulenova"
              target="_blank"
              rel="noreferrer"
              aria-label="Twitter"
            >
              <TwitterIcon fontSize="small" />
            </a>
          </div>
        </div>
        <Link to="/contact" className="home-contact-link">
          Contact
        </Link>
      </footer>
    </div>
  </div>
);

export default Home;
