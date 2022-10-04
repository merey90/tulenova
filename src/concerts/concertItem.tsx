import { Box, Button, Grid, Typography } from '@material-ui/core';

export interface IEvent {
  date: string;
  title: string;
  place: string;
  link?: string;
}

export const ConcertItem: React.FC<IEvent> = ({ date, title, place, link }) => (
  <Box className="concert-item" display="flex" justifyContent="space-between">
    <Grid container spacing={3}>
      <Grid item xs={link ? 9 : 12}>
        <Typography className="concert-item-title" gutterBottom variant="h6" align="left">
          {date}
        </Typography>
        <div className="concert-item-div" />
        <Typography variant="body2" align="left">
          {title} | {place}
        </Typography>
      </Grid>
      <Grid item xs={3} className="concert-item-button">
        {link && (
          <Button variant="contained" color="secondary" component="a" href={link} target="_blank">
            Read more
          </Button>
        )}
      </Grid>
    </Grid>
  </Box>
);
