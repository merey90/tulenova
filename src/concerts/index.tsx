import { Container, Typography, Box, Hidden } from '@material-ui/core';
import { ConcertItem, IEvent } from './concertItem';

import './styles.scss';

const cons: Array<IEvent> = [
  {
    date: 'November 17,18 2022',
    title: 'Ensemble Modern',
    place: 'Meersburg',
    link: 'https://www.meersburg.de/de/Veranstaltungen/Meersburger-KonzertGespraeche',
  },
  {
    date: 'November 19 2022',
    title: 'Ensemble Modern',
    place: 'The Music University Freiburg',
    link: 'https://www.ensemble-modern.com/de/projekte/de/kalender/2022-11-19/5800#k-5800',
  },
  {
    date: 'November 21 2022',
    title: 'Ensemble Modern',
    place: 'The Bavarian Academy of Fine arts in Munich',
    link: 'https://www.badsk.de/veranstaltungen/2022/zweite-hans-zender-akademie',
  },
  {
    date: 'August 2023',
    title: 'Das Internationales Musikinstitut Darmstadt',
    place: 'Darmstadt, Germany',
    link: 'https://internationales-musikinstitut.de/de/ferienkurse/ueber/musiker-dozenten/mira-tulenova/',
  },
];

const highlights: Array<IEvent> = [
  {
    date: '9.04. ',
    title: 'Pierrot Lunaire',
    place: "Atelier de la Main d'Or | Paris, France",
  },
  {
    date: '13.04.',
    title: 'Recital',
    place: 'Esterhazy Palace Haydn-saal',
  },
  {
    date: '15.12.',
    title: 'Concert',
    place: 'Wiener Konzerthaus Mozart-saal',
  },
  {
    date: '21.10.',
    title: 'Hosokawa',
    place: 'Japanese-German Center Berlin',
  },
];

export const Concerts: React.FC = () => {
  return (
    <div className="concerts-wrapper">
      <Container>
        <Hidden xsDown>
          <Box marginBottom={40} />
        </Hidden>
        <Box mt={2} />
        <Typography variant="h3" gutterBottom align="left" color="secondary">
          Concerts
        </Typography>
        <Box className="concerts-backdrop">
          {cons.reverse().map((concert) => (
            <ConcertItem key={concert.date} {...concert} />
          ))}
        </Box>

        <Typography variant="h4" gutterBottom align="left" color="secondary">
          Past events
        </Typography>
        <Box className="concerts-backdrop">
          {highlights.map((highlight) => (
            <ConcertItem key={highlight.date} {...highlight} />
          ))}
        </Box>
      </Container>
    </div>
  );
};
