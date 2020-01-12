import React from 'react';
import HomeComponent from './../../home/home';
import BioComponent from './../../bio/bio';
import ContactComponent from '../../contact/contact';

export interface IRoute {
  title: string;
  url: string;
  disabled?: boolean;
  exact?: boolean;
  component: React.FC;
}

export const Home: IRoute = {
  title: 'Home',
  url: '/home',
  exact: true,
  component: HomeComponent,
};

/**
 * Audio and video recordings, related news
 */
export const Portfolio: IRoute = {
  title: 'Portfolio',
  url: '/portfolio',
  disabled: true,
  component: HomeComponent,
};

export const Bio: IRoute = {
  title: 'Bio',
  url: '/bio',
  component: BioComponent,
};

/**
 * Music sheet shop
 */
export const Library: IRoute = {
  title: 'Library',
  url: '/library',
  disabled: true,
  component: HomeComponent,
};

export const Calendar: IRoute = {
  title: 'Calendar',
  url: '/calendar',
  disabled: true,
  component: HomeComponent,
};

/**
 * Photos
 */
export const Gallery: IRoute = {
  title: 'Gallery',
  url: '/gallery',
  disabled: true,
  component: HomeComponent,
};

export const Contact: IRoute = {
  title: 'Contact',
  url: '/contact',
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
