import { Container, Typography, CardContent, Box, Card } from '@material-ui/core';

interface IEvent {
  date: string;
  title: string;
  place: string;
}

const renderCards = ({ date, title, place }: IEvent, index: number, array: Array<IEvent>) => (
  <>
    <Typography gutterBottom variant="h6" align="left">
      {date}
    </Typography>
    <Typography variant="body2" align="left">
      {title}
      <br />
      {place}
    </Typography>
    {index < array.length - 1 && <hr />}
  </>
);

export const Calendar: React.FC = () => {
  const cons: Array<IEvent> = [
    {
      date: 'February 13',
      title: 'C.P.E. Bach Concerto d-moll',
      place: 'Musikzyklus Fuerstenwalde',
    },
    {
      date: 'April 2',
      title: 'Pierrot Lunaire',
      place: 'Berlin Toyo Saal',
    },
    {
      date: 'April 3',
      title: 'Pierrot Lunaire',
      place: 'Berlin Toyo Saal',
    },
    {
      date: 'April 9',
      title: 'Pierrot Lunaire',
      place: "Atelier de la Main d'Or",
    },
  ];

  const highlights = ['13.04. Esterhazy Palace Haydn-saal', '15.12 Wiener Konzerthaus Mozart-saal'];

  return (
    <Container maxWidth="md">
      <Box>
        <Card>
          <CardContent>{cons.map(renderCards)}</CardContent>
        </Card>
      </Box>
      <Box mt={4}>
        <Card>
          <CardContent>
            <Typography gutterBottom variant="h6" align="left">
              Past highlights
            </Typography>
            {highlights.map((highlight) => (
              <Typography variant="body2" align="left">
                {highlight}
              </Typography>
            ))}
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};
