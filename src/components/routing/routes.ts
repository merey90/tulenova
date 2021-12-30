import React from 'react';
import HomeComponent from '../../home/home';
import BioComponent from '../../bio/bio';
import { Gallery as GalleryComponent } from '../../gallery';

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

/**
 * Music sheet shop
 */
export const Schedule: IRoute = {
  title: 'Schedule',
  path: '/schedule',
  disabled: true,
  component: HomeComponent,
};

export const Media: IRoute = {
  title: 'Media',
  path: '/media',
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
  // Library,
  // Calendar,
  // Gallery,
];
