import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@material-ui/core';
import { MyRoutes, IRoute } from '../routing/routes';

export interface INavigation {
  handleClose: () => void;
}

export const Navigation: React.FC<INavigation> = ({ handleClose }) => {
  const { pathname } = useLocation();
  const renderLink = ({ title, path, disabled }: IRoute) => (
    <Button
      key={title}
      color={pathname === path ? 'secondary' : 'inherit'}
      to={path}
      component={Link}
      disabled={disabled}
      onClick={handleClose}
    >
      {title}
    </Button>
  );

  return <>{MyRoutes.map(renderLink)}</>;
};

export default Navigation;
