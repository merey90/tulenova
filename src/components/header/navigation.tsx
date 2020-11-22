import * as React from 'react';
import Button from '@material-ui/core/Button';
import { Link, useLocation } from 'react-router-dom';
import { Routes, IRoute } from '../routing/routes';

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

  return <>{Routes.map(renderLink)}</>;
};

export default Navigation;
