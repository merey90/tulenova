import HomeComponent from '../../home/home';
import { Bio as BioComponent } from '../../bio';
import { Contact as ContactComponent } from '../../contact';
import { Concerts as ConcertsComponent } from '../../concerts';
import { Media as MediaComponent } from '../../media';
import { Projects as ProjectsComponent } from '../../projects';
import { Blogs as BlogsComponent } from '../../blogs';

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

export const Blog: IRoute = {
  title: 'Blog',
  path: '/blog',
  component: BlogsComponent,
};

export const Projects: IRoute = {
  title: 'Projects',
  path: '/projects',
  component: ProjectsComponent,
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

export const Concerts: IRoute = {
  title: 'Concerts',
  path: '/concerts',
  component: ConcertsComponent,
};

export const Media: IRoute = {
  title: 'Media',
  path: '/media/*',
  to: '/media/photos',
  match: '/media',
  component: MediaComponent,
};

export const MyRoutes = [Home, Concerts, About, Media, Projects, Blog, Contact];
