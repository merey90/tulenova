import * as React from 'react';
import Container from '@material-ui/core/Container';
import {
  Paper,
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Link,
} from '@material-ui/core';

import './contact.scss';

export const Contact: React.FC = () => (
  <Container maxWidth="md" className="contact-container">
    <Box component={Paper} p={2}>
      <Card variant="outlined">
        <CardContent>
          <Grid container>
            <Grid item className="contact-left" xs={6}>
              <Typography variant="body1">Email</Typography>
            </Grid>
            <Grid item className="contact-right" xs={6}>
              <Typography variant="body1">
                <a href="mailto:miratulenova@gmail.com" target="_blank">
                  miratulenova@gmail.com
                </a>
              </Typography>
            </Grid>
          </Grid>
          <Grid container>
            <Grid item className="contact-left" xs={6}>
              <Typography variant="body1">Phone</Typography>
            </Grid>
            <Grid item className="contact-right" xs={6}>
              <Typography variant="body1">
                <a href="tel:0176-6868-1229">+49 176 6868 1229</a>
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  </Container>
);

export default Contact;
