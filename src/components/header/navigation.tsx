import * as React from 'react';
import Button from '@material-ui/core/Button';
import { Link } from 'react-router-dom';

export interface INavigation {
  handleClose: () => void;
}

export const Navigation: React.FC<INavigation> = ({ handleClose }) => (
  <>
    <Button color="inherit" to="/" component={Link} onClick={handleClose}>
      Home
    </Button>
    <Button color="inherit" to="/bio" component={Link} onClick={handleClose}>
      Bio
    </Button>
    <Button
      color="inherit"
      to="/"
      disabled
      component={Link}
      title="Under construction"
    >
      Downloads
    </Button>
    <Button color="inherit" to="/" disabled component={Link}>
      Calendar
    </Button>
    <Button color="inherit" to="/" disabled component={Link}>
      Gallery
    </Button>
    <Button color="inherit" to="/" disabled component={Link}>
      Contact
    </Button>
  </>
);

export default Navigation;
