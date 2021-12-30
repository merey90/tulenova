import * as React from 'react';
import { Route } from 'react-router-dom';
import { IRoute } from './routes';
import PageTitle from '../helmet/title';

export interface IProps extends IRoute {}

const Routing: React.FC<IProps> = ({
  title,
  component: Component,
  path,
}) => {
  const eComponent = (
    <>
      <PageTitle title={title} />
      <Component />
    </>
  );
  return <Route path={path} key={path} element={eComponent} />;
};

export default Routing;
