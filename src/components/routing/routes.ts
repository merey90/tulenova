import * as React from 'react';
import HomeComponent from '../../home/home';
import BioComponent from '../../bio/bio';
import { Gallery as GalleryComponent } from '../../gallery';
import { Contact as ContactComponent } from '../../contact/contact';

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
export const Concerts: IRoute = {
  title: 'Concerts',
  path: '/concerts',
  disabled: true,
  component: HomeComponent,
};

export const Media: IRoute = {
  title: 'Media',
  path: '/media',
  disabled: true,
  component: HomeComponent,
};

export const Repertoire: IRoute = {
  title: 'Repertoire',
  path: '/repertoire',
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
  component: GalleryComponent,
};

export const MyRoutes = [
  Home,
  // Portfolio,
  About,
  Contact,
  Media,
  Repertoire,
  Concerts,
  // Gallery,
];
