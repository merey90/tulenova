import { homeMediaPhotos } from './useHomeBackground';

interface HomeBackgroundProps {
  photoIndex: number | null;
}

export const HomeBackground: React.FC<HomeBackgroundProps> = ({ photoIndex }) => {
  const activePhoto = photoIndex === null ? null : homeMediaPhotos[photoIndex];

  return (
    <div className={`home-background${activePhoto ? ' home-background--active' : ''}`} aria-hidden="true">
      {activePhoto && <img key={activePhoto} className="home-background-photo" src={activePhoto} alt="" />}
      <div className="home-background-overlay" />
    </div>
  );
};
