export interface IRoute {
  title: string;
  url: string;
  disabled?: boolean;
}

export const Home: IRoute = {
  title: 'Home',
  url: '/',
};

/**
 * Audio and video recordings, related news
 */
export const Portfolio: IRoute = {
  title: 'Portfolio',
  url: '/portfolio',
  disabled: true,
};

export const Bio: IRoute = {
  title: 'Bio',
  url: '/bio',
};

/**
 * Music sheet shop
 */
export const Library: IRoute = {
  title: 'Library',
  url: '/library',
  disabled: true,
};

export const Calendar: IRoute = {
  title: 'Calendar',
  url: '/calendar',
  disabled: true,
};

/**
 * Photos
 */
export const Gallery: IRoute = {
  title: 'Gallery',
  url: '/gallery',
  disabled: true,
};

export const Contact: IRoute = {
  title: 'Contact',
  url: '/contact',
};

export const routes = [
  Home,
  // Portfolio,
  Bio,
  // Library,
  // Calendar,
  // Gallery,
  Contact,
];
