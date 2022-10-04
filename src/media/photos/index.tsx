import { useState } from 'react';
import { Backdrop, ImageList, ImageListItem } from '@material-ui/core';
import { IImageItem, imageItems } from './utils';

import './styles.scss';

export const Photos: React.FC = () => {
  const [image, setImage] = useState<IImageItem | null>(null);

  const handleItemClick = (item: IImageItem) => {
    setImage(item);
  };

  const handleClose = () => {
    setImage(null);
  };

  return (
    <>
      <ImageList cols={4}>
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
