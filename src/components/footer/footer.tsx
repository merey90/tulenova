import * as React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';

import './footer.scss';

export const Footer: React.FC = () => (
  <footer className="footer">
    <Container>
      <Typography variant="body2">© Copyright 2020</Typography>
    </Container>
  </footer>
);

export default Footer;
