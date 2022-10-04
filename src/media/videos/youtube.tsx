import './styles.scss';

interface IYoutube {
  embedId: string;
}

export const Youtube: React.FC<IYoutube> = ({ embedId }) => (
  <div className="video-responsive">
    <iframe
      src={`https://www.youtube.com/embed/${embedId}`}
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  </div>
);
