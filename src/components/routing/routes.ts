import React from 'react';
import HomeComponent from '../../home/home';
import BioComponent from '../../bio/bio';
import ContactComponent from '../../contact/contact';

export interface IRoute {
  title: string;
  path: string;
  disabled?: boolean;
  exact?: boolean;
  component: React.FC;
}

export const Home: IRoute = {
  title: 'Home',
  path: '/home',
  exact: true,
  component: HomeComponent,
};

/**
 * Audio and video recordings, related news
 */
export const Portfolio: IRoute = {
  title: 'Portfolio',
  path: '/portfolio',
  disabled: true,
  component: HomeComponent,
};

export const Bio: IRoute = {
  title: 'Bio',
  path: '/bio',
  component: BioComponent,
};

/**
 * Music sheet shop
 */
export const Library: IRoute = {
  title: 'Library',
  path: '/library',
  disabled: true,
  component: HomeComponent,
};

export const Calendar: IRoute = {
  title: 'Calendar',
  path: '/calendar',
  disabled: true,
  component: HomeComponent,
};

/**
 * Photos
 */
export const Gallery: IRoute = {
  title: 'Gallery',
  path: '/gallery',
  disabled: true,
  component: HomeComponent,
};

export const Contact: IRoute = {
  title: 'Contact',
  path: '/contact',
  component: ContactComponent,
};

export const Routes = [
  Home,
  // Portfolio,
  Bio,
  // Library,
  // Calendar,
  // Gallery,
  Contact,
];

export default Routes;
