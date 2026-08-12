import { useEffect, useState } from 'react';
import { Backdrop, ImageList, ImageListItem, useMediaQuery, useTheme } from '@material-ui/core';
import { IImageItem, imageItems } from './utils';

import './styles.scss';

function usePhotoGrid() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const cols = isMobile ? 2 : isTablet ? 3 : 4;

  const [rowHeight, setRowHeight] = useState(() =>
    typeof window !== 'undefined' ? Math.floor(window.innerWidth / cols) : 180
  );

  useEffect(() => {
    const update = () => setRowHeight(Math.floor(window.innerWidth / cols));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [cols]);

  return { cols, rowHeight };
}

export const Photos: React.FC = () => {
  const [image, setImage] = useState<IImageItem | null>(null);
  const { cols, rowHeight } = usePhotoGrid();

  const handleItemClick = (item: IImageItem) => {
    setImage(item);
  };

  const handleClose = () => {
    setImage(null);
  };

  return (
    <>
      <ImageList cols={cols} rowHeight={rowHeight} className="photo-grid">
        {imageItems.map((item) => (
          <ImageListItem
            onClick={() => handleItemClick(item)}
            className="img-item"
            key={item.img}
            cols={item.cols || 1}
          >
            <img src={item.img} alt={item.title} />
          </ImageListItem>
        ))}
      </ImageList>
      <Backdrop className="backdrop" open={!!image} onClick={handleClose}>
        {image && <img src={image.img} alt={image.title} />}
      </Backdrop>
    </>
  );
};
