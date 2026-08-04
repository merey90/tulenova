import { Link } from 'react-router-dom';
import { goldenDelay } from './goldenRatio';
import './installationNav.scss';

const sections = [
  {
    id: 'music',
    label: 'Concerts',
    description: 'Live performance',
    path: '/concerts',
  },
  {
    id: 'media',
    label: 'Media',
    description: 'Photo, film & audio',
    path: '/media/photos',
  },
  {
    id: 'projects',
    label: 'Research',
    description: 'Projects & curation',
    path: '/projects',
  },
  {
    id: 'about',
    label: 'About',
    description: 'Biography & work',
    path: '/about',
  },
];

export const InstallationNav: React.FC<{ variant?: 'default' | 'header' }> = ({ variant = 'default' }) => (
  <nav
    className={`home-sections${variant === 'header' ? ' home-sections--header' : ''}`}
    aria-label="Primary navigation"
  >
    {variant === 'header' && (
      <svg className="home-sections-orbit home-sections-orbit--header" viewBox="0 0 320 48" aria-hidden="true">
        <path className="home-sections-path" d="M 8 36 Q 160 4 312 36" />
      </svg>
    )}

    {variant !== 'header' && (
      <svg className="home-sections-orbit" viewBox="0 0 400 80" preserveAspectRatio="none" aria-hidden="true">
        <path className="home-sections-path" d="M 12 40 Q 200 8 388 40" />
      </svg>
    )}

    <div className="home-sections-list">
      {sections.map((section, index) => (
        <Link
          key={section.id}
          to={section.path}
          className="home-section-link"
          title={section.description}
          style={{ animationDelay: `${goldenDelay(index).toFixed(3)}s` }}
        >
          <span className="home-section-node" aria-hidden="true">
            <span className="home-section-node-core" />
            <span className="home-section-node-ring" />
          </span>
          <span className="home-section-copy">
            <span className="home-section-label">{section.label}</span>
            <span className="home-section-description">{section.description}</span>
          </span>
        </Link>
      ))}
    </div>
  </nav>
);
