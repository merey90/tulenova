import { Box, Container, Grid, Hidden, Typography } from '@material-ui/core';

import './styles.scss';

export const Bio: React.FC = () => {
  return (
    <Container className="bio-wrapper">
      <Hidden xsDown>
        <Box marginBottom={40} />
      </Hidden>
      <Box mt={2} />
      <Typography variant="h3" gutterBottom align="left" color="secondary">
        Biography
      </Typography>
      <Grid container>
        <Grid item xs={12} md={6}>
          <Box className="bio-backdrop">
            <p>
              Mira Tulenova was born in Almaty, into a family of musicians and artists. At the age of 6 she was accepted
              to the violin, piano and flute classes of the Republican Secondary Specialized Music Boarding School for
              gifted children, having chosen the flute as her main instrument with recommendation of Helga Kuster and
              the American National Flute Association. Mira won her first prize in an international music festival
              called ‘The Voice of Asia’ at the age of ten. In the same year, she won the Soros foundation scholarship
              for the Central Music School of Moscow State Tchaikovsky Conservatory. During her study, she was awarded
              at many important competitions and festivals in Kazakhstan, Russia, Hungary, Latvia, Romania. After
              school, she was invited to work with the Symphony orchestra of the Kazakh State Philharmonic and won a
              presidential scholarship to study at the National Conservatory and also a DAAD-prize to study in Germany
              with Bettina Wilde and Renate Greiss-Armin.
            </p>
            <p>
              She joined master classes with well-known flutists, such as Pierre-Yves Artaud, Aurele Nicolet, Andrea
              Lieberknecht, Yuri Dolzhikov, James Galway, Emmanuel Pahud, Mario Caroli.
            </p>
            <p>
              Since 2010, she has worked with the Kazakh State symphony orchestra, “Eegeru” contemporary music ensemble,
              the Moscow Philharmonic Orchestra, the Meyerhold’s Center for Performing Arts, the ORTA Center, the
              Camerata Kazakhstan and with composers and conductors - Tristan Murail, Klaus Lang, Aigerim Seilova,
              Dmitri Kourliandski, Sanzhar Baiterekov, Valery Gergiev, Fedor Lednev, Renat Salavatov, Alan Buribaev,
              Jan-Moritz Onken, among other musicians.
            </p>
            <p>
              She took part in festivals such as Musikfestspiele Berlin, Zermatt, Nauryz XXI contemporary music
              festival, Kasachische Perlen, Young Euro Classic and others.
            </p>
            <p>
              As a soloist and as a member of orchestras and ensembles, she has had concerts in the USA (Carnegie Hall,
              Kennedy Center), Germany (Berlin Philharmonic, Elbphilharmonie, Beethovenhalle), Austria (Wiener
              Konzerthaus, Musikverein), Russia, Hungary, France, Holland, Slovenia and in other countries.
            </p>
            <p>
              Mira speaks English, German, Russian, Kazakh, French and resides and studies in Berlin, Germany between
              concerts.
            </p>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};
