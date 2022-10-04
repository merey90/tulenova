import { Button, Grid, Typography } from '@material-ui/core';
import FacebookIcon from '@material-ui/icons/Facebook';
import InstagramIcon from '@material-ui/icons/Instagram';
import TwitterIcon from '@material-ui/icons/Twitter';
import { Link } from 'react-router-dom';
import './home.scss';

export const Home: React.FC = () => (
  <div className="home-container">
    <Grid container>
      <Grid item xs={12} sm={6} className="home-name">
        <Typography variant="h3">Mira Tulenova</Typography>
      </Grid>
      <Grid item xs={12} sm={6} className="home-links">
        <Grid container>
          <Grid item xs={12}>
            <a className="social-link" href="https://www.facebook.com/mira.tulenova" target="_blank">
              <FacebookIcon fontSize="large" />
            </a>
            <a className="social-link" href="https://www.instagram.com/mira_tulenova/" target="_blank">
              <InstagramIcon fontSize="large" />
            </a>
            <a className="social-link" href="https://www.instagram.com/mira_tulenova/" target="_blank">
              <TwitterIcon fontSize="large" />
            </a>
          </Grid>
          <Grid item xs={12}>
            <Button component={Link} to="/concerts" variant="contained" color="secondary">
              MAIN SITE
            </Button>
            <Button component={Link} to="/contact" variant="contained" color="secondary">
              CONTACT
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  </div>
);

export default Home;
