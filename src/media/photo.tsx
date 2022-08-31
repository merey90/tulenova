import { Card, CardActionArea, CardMedia } from '@material-ui/core';

export const Photo: React.FC = () => (
  <Card>
    <CardActionArea>
      <CardMedia component="img" height="140" image="/background.jpg" alt="green iguana" />
    </CardActionArea>
  </Card>
);
