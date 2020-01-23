import * as React from 'react';
import { Helmet } from 'react-helmet';
import { Home } from '../routing/routes';

export interface IProps {
  title?: string;
}

const PageTitle: React.FC<IProps> = ({ title }) => {
  const mika = 'Mira Tulenova';
  const eTitle = title === Home.title ? '' : title;
  const completeTitle = eTitle ? `${eTitle} | ${mika}` : mika;
  return (
    <Helmet>
      <title>{completeTitle}</title>
    </Helmet>
  );
};

export default PageTitle;
