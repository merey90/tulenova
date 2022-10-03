import { Button, Typography } from '@material-ui/core';
import FacebookIcon from '@material-ui/icons/Facebook';
import InstagramIcon from '@material-ui/icons/Instagram';
import TwitterIcon from '@material-ui/icons/Twitter';
import { Link } from 'react-router-dom';
import './home.scss';

export const Home: React.FC = () => (
  <div className="home-container">
    <Typography className="home-name" variant="h3">
      Mira Tulenova
    </Typography>
    <span className="home-links">
      <a className="social-link" href="https://www.facebook.com/mira.tulenova" target="blank">
        <FacebookIcon fontSize="large" />
      </a>
      <a className="social-link" href="https://www.instagram.com/mira_tulenova/" target="blank">
        <InstagramIcon fontSize="large" />
      </a>
      <a className="social-link" href="https://www.instagram.com/mira_tulenova/" target="blank">
        <TwitterIcon fontSize="large" />
      </a>
      <Button component={Link} to="/concerts" variant="outlined">
        MAIN SITE
      </Button>
      <Button component={Link} to="/contact" variant="outlined">
        CONTACT
      </Button>
    </span>
  </div>
);

export default Home;
