import { useState } from 'react';
import { Link } from 'react-router-dom';
import FacebookIcon from '@material-ui/icons/Facebook';
import InstagramIcon from '@material-ui/icons/Instagram';
import TwitterIcon from '@material-ui/icons/Twitter';
import MenuIcon from '@material-ui/icons/Menu';
import CloseIcon from '@material-ui/icons/Close';
import { InstallationNav } from './installationNav';
import { HomeBackground } from './homeBackground';
import { SculptureInstallation } from './sculptureInstallation';
import { useHomeBackground } from './useHomeBackground';
import './home.scss';

const installation = {
  tag: 'Sound installation',
  title: 'Golden Ratio Progression',
  meta: 'Interactive audio · live bass flute performance',
  text: 'An immersive sound field drawn from a live bass flute recording. Move through the constellation to explore pitches, resonance, and spatial motion.',
};

const feedSections = [
  {
    id: 'on-view',
    title: 'On view',
    items: [
      {
        tag: installation.tag,
        heading: installation.title,
        meta: installation.meta,
        text: installation.text,
        link: null,
      },
    ],
  },
  {
    id: 'performances',
    title: 'Performances',
    items: [
      {
        tag: 'Concert',
        heading: 'Day 1: Monat der zeitgenössischen Musik festival',
        meta: 'Kühlhaus Berlin, Germany · Oktober 4 2025',
        text: null,
        link: { label: 'View performances', path: '/concerts' },
      },
    ],
  },
  {
    id: 'research',
    title: 'Research',
    items: [
      {
        tag: 'Project',
        heading: 'Curatorial and interdisciplinary practice',
        meta: 'Projects, curation, and cultural research',
        text: null,
        link: { label: 'View research', path: '/projects' },
      },
    ],
  },
  {
    id: 'media',
    title: 'Media',
    items: [
      {
        tag: 'Archive',
        heading: 'Photo, film & audio',
        meta: 'Documentation of performances and collaborations',
        text: null,
        link: { label: 'View media', path: '/media/photos' },
      },
    ],
  },
];

export const Home: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { photoIndex, showIntro, showDescription } = useHomeBackground();

  return (
    <div className="home-container">
      <HomeBackground photoIndex={photoIndex} />
      <SculptureInstallation />

      <header className="home-topbar">
        <button
          type="button"
          className="home-menu-button"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <CloseIcon fontSize="small" /> : <MenuIcon fontSize="small" />}
        </button>

        <InstallationNav variant="header" />

        <div className="home-topbar-utils">
          <Link to="/contact" className="home-topbar-link">
            Contact
          </Link>
        </div>

        <Link to="/" className="home-mark" aria-label="Mira Tulenova home">
          <span className="home-mark-text">Mira Tulenova</span>
        </Link>
      </header>

      <div className={`home-menu${menuOpen ? ' home-menu--open' : ''}`} aria-hidden={!menuOpen}>
        <nav className="home-menu-nav" aria-label="Site menu">
          <Link to="/concerts" className="home-menu-link" onClick={() => setMenuOpen(false)}>
            Performances
          </Link>
          <Link to="/media/photos" className="home-menu-link" onClick={() => setMenuOpen(false)}>
            Media
          </Link>
          <Link to="/projects" className="home-menu-link" onClick={() => setMenuOpen(false)}>
            Research
          </Link>
          <Link to="/about" className="home-menu-link" onClick={() => setMenuOpen(false)}>
            About
          </Link>
          <Link to="/contact" className="home-menu-link" onClick={() => setMenuOpen(false)}>
            Contact
          </Link>
        </nav>
      </div>

      <section className={`home-hero${showIntro ? ' home-hero--intro' : ''}`} aria-label="Sound installation hero">
        {showIntro ? (
          <article
            className={`home-installation-intro${showDescription ? ' home-installation-intro--visible' : ''}`}
            aria-labelledby="installation-title"
            aria-hidden={!showDescription}
          >
            <p className="home-installation-tag">// {installation.tag}</p>
            <h1 id="installation-title" className="home-installation-title">
              {installation.title}
            </h1>
            <p className="home-installation-meta">{installation.meta}</p>
            <p className="home-installation-text">{installation.text}</p>
          </article>
        ) : (
          <>
            <div className="home-sound-cta" aria-hidden="true">
              <span className="home-sound-cta-ring">
                <span className="home-sound-cta-pulse" />
              </span>
              <span className="home-sound-cta-label">Sound on</span>
            </div>
            <a href="#home-feed" className="home-scroll-cue">
              Scroll down
            </a>
          </>
        )}
      </section>

      <main id="home-feed" className="home-feed">
        <div className="home-feed-intro">
          <p className="home-feed-role">Musician · Interdisciplinary Artist · Curator · Cultural Researcher</p>
        </div>

        {feedSections.map((section) => (
          <section key={section.id} className="home-feed-section" aria-labelledby={`section-${section.id}`}>
            <h2 id={`section-${section.id}`} className="home-feed-heading">
              {section.title}
            </h2>
            <div className="home-feed-items">
              {section.items.map((item) => (
                <article key={item.heading} className="home-feed-item">
                  <p className="home-feed-tag">// {item.tag}</p>
                  <h3 className="home-feed-item-title">{item.heading}</h3>
                  <p className="home-feed-item-meta">{item.meta}</p>
                  {item.text && <p className="home-feed-item-text">{item.text}</p>}
                  {item.link && (
                    <Link to={item.link.path} className="home-feed-link">
                      ⟶ {item.link.label}
                    </Link>
                  )}
                </article>
              ))}
            </div>
          </section>
        ))}
      </main>

      <footer className="home-footer">
        <div className="home-social">
          <a
            className="social-link"
            href="https://www.facebook.com/mira.tulenova"
            target="_blank"
            rel="noreferrer"
            aria-label="Facebook"
          >
            <FacebookIcon fontSize="small" />
          </a>
          <a
            className="social-link"
            href="https://www.instagram.com/mira_tulenova/"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
          >
            <InstagramIcon fontSize="small" />
          </a>
          <a
            className="social-link"
            href="https://mobile.twitter.com/miratulenova"
            target="_blank"
            rel="noreferrer"
            aria-label="Twitter"
          >
            <TwitterIcon fontSize="small" />
          </a>
        </div>
        <p className="home-footer-note">© Mira Tulenova</p>
      </footer>
    </div>
  );
};

export default Home;
