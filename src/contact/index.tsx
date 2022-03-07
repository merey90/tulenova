import * as React from 'react';
import { Paper, Box, Card, CardContent, Typography, Grid, Container } from '@material-ui/core';

import './contact.scss';

export const Contact: React.FC = () => (
  <Container maxWidth="md" className="contact-container">
    <Box component={Paper} p={2}>
      <Card variant="outlined">
        <CardContent>
          <Grid container>
            <Grid item className="contact-left" xs={4} sm={6}>
              <Typography variant="body1">Email</Typography>
            </Grid>
            <Grid item className="contact-right" xs={8} sm={6}>
              <Typography variant="body1">
                <a href="mailto:miratulenova@gmail.com" target="_blank" rel="noopener noreferrer">
                  miratulenova@gmail.com
                </a>
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  </Container>
);
