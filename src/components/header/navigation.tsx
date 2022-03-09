import { Link, useLocation } from 'react-router-dom';
import { Button } from '@material-ui/core';

import { MyRoutes, IRoute } from '../routing/routes';

export interface INavigation {
  handleClose: () => void;
}

enum EButtonColor {
  secondary = 'secondary',
  inherit = 'inherit',
}

export const Navigation: React.FC<INavigation> = ({ handleClose }) => {
  const { pathname } = useLocation();

  const isActiveNav = (path: string): EButtonColor => {
    if (path === '/') {
      return path === pathname ? EButtonColor.secondary : EButtonColor.inherit;
    } else return pathname.includes(path) ? EButtonColor.secondary : EButtonColor.inherit;
  };

  const renderLink = ({ title, path, to, match, disabled }: IRoute) => (
    <Button
      key={title}
      color={isActiveNav(match || path)}
      to={to || path}
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
