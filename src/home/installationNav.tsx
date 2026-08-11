import { Link } from 'react-router-dom';
import './installationNav.scss';

const sections = [
  { id: 'music', label: 'Performances', path: '/concerts' },
  { id: 'media', label: 'Media', path: '/media/photos' },
  { id: 'projects', label: 'Research', path: '/projects' },
  { id: 'about', label: 'About', path: '/about' },
];

export const InstallationNav: React.FC<{ variant?: 'default' | 'header' }> = ({ variant = 'default' }) => (
  <nav
    className={`home-sections${variant === 'header' ? ' home-sections--header' : ''}`}
    aria-label="Primary navigation"
  >
    <ul className="home-sections-list">
      {sections.map((section) => (
        <li key={section.id} className="home-sections-item">
          <Link to={section.path} className="home-section-link">
            {section.label}
          </Link>
        </li>
      ))}
    </ul>
  </nav>
);
