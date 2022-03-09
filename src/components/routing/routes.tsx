import HomeComponent from '../../home/home';
import { Bio as BioComponent } from '../../bio';
import { Contact as ContactComponent } from '../../contact';
import { Calendar as CalendarComponent } from '../../calendar';
import { Media as MediaComponent } from '../../media';

export interface IRoute {
  title: string;
  path: string;
  to?: string;
  disabled?: boolean;
  component: React.FC;
  match?: string;
}

export const Home: IRoute = {
  title: 'Home',
  path: '/',
  component: HomeComponent,
};

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

export const Calendar: IRoute = {
  title: 'Calendar',
  path: '/calendar',
  component: CalendarComponent,
};

export const Media: IRoute = {
  title: 'Media',
  path: '/media/*',
  to: '/media/photos',
  match: '/media',
  component: MediaComponent,
};

export const Repertoire: IRoute = {
  title: 'Repertoire',
  path: '/repertoire',
  component: HomeComponent,
};

export const MyRoutes = [Home, Calendar, About, Repertoire, Media, Contact];
