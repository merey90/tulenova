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
              Mira Tulenova is a Kazakh-German flutist who is deeply passionate about contemporary music. As a member of
              the new generation of international musicians dedicated to pushing the boundaries of their art, she
              constantly explores new ways to experiment with sound and technical possibilities. Mira is known for her
              innovative and daring approach to music, and she has quickly gained recognition in the world of
              contemporary classical and experimental music.
            </p>
            <p>
              Mira was born into a family of musicians and artists in Almaty. She began her professional musical studies
              at a young age at the Republican Music School for Talented Children, selecting the flute as her main
              instrument with a recommendation from Helga Kuster and the American National Flute Association. Mira won
              her first prize at the age of ten in an international music festival "The Voice of Asia." In the same
              year, she won the Soros Foundation scholarship for the Central Music School of Moscow State Tchaikovsky
              Conservatory. During her studies, she was awarded numerous prizes at important competitions and festivals
              in Kazakhstan, Russia, Hungary, Latvia, and Romania, and quickly established herself as a sought-after
              performer, playing with orchestras and ensembles such as the Moscow Philharmonic Orchestra and Camerata
              Kazakhstan. After school, she was invited to work permanently with the State Academic Symphony Orchestra
              of the Republic of Kazakhstan and won a presidential scholarship to study at the National Conservatory, as
              well as a DAAD prize to study at the Hochschule für Künste Bremen and the Hochschule für Musik Karlsruhe,
              receiving a master's degree in music and art. During her career, she trained with flutists such as
              Pierre-Yves Artaud, Aurèle Nicolet, Sophie Cherrier, Andrea Lieberknecht, Yuri Dolzhikov, James Galway,
              Renate Greiss-Armin, Emmanuel Pahud, Bettina Wilde, Yerkhat Nurgaliyev, Balzhan Orazbayeva, Mario Caroli,
              Benoit Fromanger, Christoph Huntgeburth, and Dietmar Wiesner. She has collaborated with renowned
              conductors, including Valery Gergiev, Fedor Lednev, Renat Salavatov, Teodor Currentzis, Alan Buribaev,
              Jan-Moritz Onken, Arnaud Arbet and many other musicians.
            </p>
            <p>
              Her passion for contemporary music led her to become a founding member of the ensemble of contemporary and
              experimental music EEGERU. She has worked with the Meyerhold Center for Performing Arts, the ORTA Center,
              and many other collectives and musicians.
            </p>
            <p>
              She has premiered works by Tristan Murail, Klaus Lang, Aigerim Seilova, Hans Zender, Anton Safronov,
              Dmitri Kourliandski, Sanzhar Baiterekov, Tokzhan Karatai, Oleg Paiberdin, David Lang, and Rakhat-Bi
              Abdyssagin.
            </p>
            <p>
              She has taken part in festivals such as Musikfest Berlin, Zermatt, Aix-en-Provence, Nauryz XXI
              contemporary music festival, Kasachische Perlen, Откровение, Young Euro Classic, and others.
            </p>
            <p>
              Mira's performances have taken her to many prestigious concert halls, including the Berlin Philharmonie,
              Carnegie Hall, Kennedy Center, Elbphilharmonie, Beethovenhalle, Wiener Konzerthaus, Musikverein, and many
              other stages in France, Russia, Hungary, Holland, Slovenia, and other countries.
            </p>
            <p>
              Mira speaks English, German, Russian, Kazakh, French, and Turkish, and resides in Berlin, Germany, where
              she works and studies between concerts. She is a member of the Initiative Neue Musik Berlin.
            </p>
            <p>
              Parallel to her musical career, Mira has contributed to the cultural policy of Kazakhstan and the
              preservation of the cultural heritage of Central Asia. Since 2012, she has worked as a researcher, culture
              expert, and project manager for the Research Institute of Culture, UNESCO Central Asia, Association of
              Museums, and the Ministry of Culture of Kazakhstan.
            </p>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};
