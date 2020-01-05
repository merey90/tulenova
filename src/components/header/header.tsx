import * as React from 'react';
import { AppBar, Typography, Toolbar, IconButton } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import MenuIcon from '@material-ui/icons/Menu';

import './header.scss';
import Container from '@material-ui/core/Container';

export const Header: React.FC = () => (
  <AppBar position="static" className="header">
    <Container maxWidth="md">
      <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="menu">
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" className="header-typo">
          Home
        </Typography>
        <Button color="inherit">Login</Button>
      </Toolbar>
    </Container>
  </AppBar>
);

export default Header;
