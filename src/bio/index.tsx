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
              Mira Tulenova is a Kazakh-German musician, interdisciplinary artist, curator, and cultural researcher
              based in Berlin. Her practice moves between contemporary and experimental music, performance, artistic
              research, curatorial work, and cultural heritage, with a particular interest in Central Asia,
              transnational identities, sound, memory, and the ways cultural narratives are produced and transmitted.
            </p>
            <p>
              Trained as a classical flutist and composer, Tulenova developed an early interest in contemporary music
              and experimental approaches to sound. Born into a family of musicians and artists in Almaty, Kazakhstan,
              she began her professional musical education at the Republican Music School for Talented Children. At the
              age of ten, she won her first prize at the international music festival The Voice of Asia. In the same
              year, she won the Soros Foundation scholarship for the Central Music School of Moscow State Tchaikovsky
              Conservatory. She continued her education in Kazakhstan and Germany, including studies at the Hochschule
              für Künste Bremen and the Hochschule für Musik Karlsruhe, where she received a master&apos;s degree in
              music and art.
            </p>
            <p>
              Her musical practice has been shaped through encounters with leading performers and pedagogues including
              Pierre-Yves Artaud, Aurèle Nicolet, Sophie Cherrier, Andrea Lieberknecht, Yuri Dolzhikov, James Galway,
              Emmanuel Pahud, Mario Caroli, Benoît Fromanger, Christoph Huntgeburth, and Dietmar Wiesner. She has
              collaborated with conductors and musicians including Valery Gergiev, Fedor Lednev, Renat Salavatov, Teodor
              Currentzis, Alan Buribayev, Jan-Moritz Onken, and Arnaud Arbet.
            </p>
            <p>
              Tulenova is a founding member of EEGERU, an ensemble dedicated to contemporary and experimental music. Her
              artistic collaborations have extended beyond conventional concert formats to interdisciplinary contexts,
              including projects with the Meyerhold Center for Performing Arts, the ORTA Center, independent artists,
              composers, and experimental collectives.
            </p>
            <p>
              As a performer, she has premiered and interpreted works by composers including Tristan Murail, Klaus Lang,
              Aigerim Seilova, Hans Zender, Anton Safronov, Dmitri Kourliandski, Sanzhar Baiterekov, Tokzhan Karatai,
              Oleg Paiberdin, David Lang, and Rakhat-Bi Abdyssagin. Her projects have been presented at festivals
              including Musikfest Berlin, Zermatt Festival, Festival d&apos;Aix-en-Provence, Nauryz XXI, Kasachische
              Perlen, Otkrovenie, and Young Euro Classic, as well as at venues including the Berlin Philharmonie,
              Carnegie Hall, the Kennedy Center, Elbphilharmonie, Beethovenhalle, Wiener Konzerthaus, and Musikverein.
            </p>
            <p>
              Alongside her artistic practice, Tulenova has worked extensively in cultural research, curating, cultural
              policy, and heritage preservation, with a particular focus on Kazakhstan and Central Asia. Since 2012, she
              has contributed as a researcher, cultural expert, curator, and project manager to projects connected with
              the Research Institute of Culture, UNESCO initiatives in Central Asia, the Association of Museums, and the
              Ministry of Culture of Kazakhstan. She is a curator of the Central Asian programme of VOICES Festival
              Berlin and Month of Contemporary Music Berlin, and has also collaborated with Berliner Festspiele on
              curatorial and interdisciplinary cultural projects.
            </p>
            <p>
              Her interdisciplinary work considers music not only as a performance practice but also as a form of
              cultural knowledge and a space for critical inquiry. Through artistic, research-based, and curatorial
              projects, she explores relationships between sound and place, archives and living memory, cultural
              inheritance and contemporary artistic production, as well as the complex histories and identities
              connecting Central Asia and Europe.
            </p>
            <p>
              Tulenova is a member of Initiative Neue Musik Berlin. She speaks Kazakh, Russian, German, English, French,
              and Turkish and lives and works in Berlin.
            </p>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};
