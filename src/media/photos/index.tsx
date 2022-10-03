import { ImageList, ImageListItem } from '@material-ui/core';
import { imageItems } from './utils';

import './styles.scss';

export const Photos: React.FC = () => (
  <ImageList cols={4}>
    {imageItems.map((item) => (
      <ImageListItem className="img-item" key={item.img} cols={item.cols || 1}>
        <img src={item.img} alt={item.title} />
      </ImageListItem>
    ))}
  </ImageList>
);
