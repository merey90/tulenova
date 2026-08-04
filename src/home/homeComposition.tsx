import './homeComposition.scss';

export const HomeComposition: React.FC = () => (
  <div className="home-composition" aria-hidden="true">
    <svg className="home-golden-spiral" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="home-spiral-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(184, 174, 164, 0.15)" />
          <stop offset="61.8%" stopColor="rgba(184, 174, 164, 0.55)" />
          <stop offset="100%" stopColor="rgba(92, 86, 79, 0.35)" />
        </linearGradient>
      </defs>
      <path
        className="home-golden-spiral-path"
        stroke="url(#home-spiral-gradient)"
        d="M123.6 200 C123.6 123.6 200 123.6 200 76.4 C200 47.3 176.4 23.6 147.2 23.6 C128.9 23.6 114.1 38.4 114.1 56.7 C114.1 68.9 123.5 78.3 135.7 78.3"
      />
      <circle className="home-golden-node" cx="123.6" cy="123.6" r="2.4" />
    </svg>

    <div className="home-composition-orbit home-composition-orbit--one" />
    <div className="home-composition-orbit home-composition-orbit--two" />
  </div>
);
