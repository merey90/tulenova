import { AppBar, Toolbar, IconButton, Container, Hidden, Zoom, SwipeableDrawer } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import CloseIcon from '@material-ui/icons/Close';
import { useLocation } from 'react-router-dom';

import './header.scss';

import Navigation from './navigation';
import { useState } from 'react';

export const Header: React.FC = () => {
  const { pathname } = useLocation();
  if (pathname === '/') return null;

  const [isDrawerOpen, setDrawerState] = useState(false);
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
            <Hidden xsDown>
              <Navigation handleClose={closeDrawer} />
            </Hidden>
          </Toolbar>
        </Container>
      </AppBar>
      {/* eslint-disable-next-line @typescript-eslint/no-empty-function */}
      <SwipeableDrawer open={isDrawerOpen} onClose={closeDrawer} onOpen={() => {}}>
        <div className="sidebar">
          <Navigation handleClose={closeDrawer} />
        </div>
      </SwipeableDrawer>
    </>
  );
};

export default Header;
