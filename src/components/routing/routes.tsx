import * as React from 'react';
import HomeComponent from '../../home/home';
import { Bio as BioComponent } from '../../bio';
import { Gallery as GalleryComponent } from '../../gallery';
import { Contact as ContactComponent } from '../../contact';
import { Calendar as CalendarComponent } from '../../concerts';

export interface IRoute {
  title: string;
  path: string;
  disabled?: boolean;
  component: React.FC;
}

export const Home: IRoute = {
  title: 'Home',
  path: '/',
  component: HomeComponent,
};

/**
 * Audio and video recordings, related news
 */
export const News: IRoute = {
  title: 'News',
  path: '/news',
  disabled: true,
  component: HomeComponent,
};

export const About: IRoute = {
  title: 'About',
  path: '/about',
  component: BioComponent,
};

export const Contact: IRoute = {
  title: 'Contact',
  path: '/contact',
  component: ContactComponent,
};

/**
 * Music sheet shop
 */
export const Calendar: IRoute = {
  title: 'Calendar',
  path: '/calendar',
  component: CalendarComponent,
};

export const Media: IRoute = {
  title: 'Media',
  path: '/media',
  component: HomeComponent,
};

export const Repertoire: IRoute = {
  title: 'Repertoire',
  path: '/repertoire',
  component: HomeComponent,
};

/**
 * Photos
 */
export const Gallery: IRoute = {
  title: 'Gallery',
  path: '/gallery',
  disabled: true,
  component: GalleryComponent,
};

export const MyRoutes = [
  Home,
  // Portfolio,
  Calendar,
  About,
  Repertoire,
  Media,
  Contact,
  // Gallery,
];
