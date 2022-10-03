import { Box, Button, Typography } from '@material-ui/core';
import './styles.scss';

export interface IBlog {
  date: string;
  title: string;
  description: string;
  link: string;
  guid: string;
}

export const BlogItem: React.FC<IBlog> = ({ title, description, link }) => (
  <Box className="project-item" display="flex" justifyContent="space-between">
    <Box paddingRight={1}>
      <Typography className="project-item-title" gutterBottom variant="h6" align="left">
        {title}
      </Typography>
      <div className="project-item-div" />
      <Typography variant="body2" align="left">
        {description.substring(4, 300)}...
      </Typography>
    </Box>
    <Box alignSelf="flex-end">
      <Button variant="contained" color="secondary" component="a" href={link} target="_blank">
        Read more
      </Button>
    </Box>
  </Box>
);
