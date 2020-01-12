import * as React from 'react';
import Button from '@material-ui/core/Button';
import { Link, useHistory } from 'react-router-dom';
import { Routes, IRoute } from './routes';

export interface INavigation {
  handleClose: () => void;
}

export const Navigation: React.FC<INavigation> = ({ handleClose }) => {
  const {
    location: { pathname },
  } = useHistory();
  const renderLink = ({ title, url, disabled }: IRoute) => (
    <Button
      key={title}
      color={pathname === url ? 'secondary' : 'inherit'}
      to={url}
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
