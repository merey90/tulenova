import * as React from 'react';
import { AppBar, Typography, Toolbar, IconButton } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import CloseIcon from '@material-ui/icons/Close';

import Container from '@material-ui/core/Container';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import Hidden from '@material-ui/core/Hidden';

import './header.scss';

import Navigation from './navigation';
import Zoom from '@material-ui/core/Zoom';

export const Header: React.FC = () => {
  const [isDrawerOpen, setDrawerState] = React.useState(false);
  const closeDrawer = () => setDrawerState(false);
  const triggerDrawer = () => setDrawerState(!isDrawerOpen);
  return (
    <>
      <AppBar position="static" className="header">
        <Container maxWidth="md">
          <Toolbar>
            <Hidden smUp>
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={triggerDrawer}
                className="menu-button"
              >
                <Zoom in={!isDrawerOpen}>
                  <MenuIcon />
                </Zoom>
                <Zoom in={isDrawerOpen}>
                  <CloseIcon />
                </Zoom>
              </IconButton>
            </Hidden>
            <Typography variant="h6" className="header-typo">
              Meruyert Tulenova
            </Typography>
            <Hidden xsDown>
              <Navigation handleClose={closeDrawer} />
            </Hidden>
          </Toolbar>
        </Container>
      </AppBar>
      <SwipeableDrawer
        open={isDrawerOpen}
        onClose={closeDrawer}
        onOpen={() => {}}
      >
        <div className="sidebar">
          <Navigation handleClose={closeDrawer} />
        </div>
      </SwipeableDrawer>
    </>
  );
};

export default Header;
