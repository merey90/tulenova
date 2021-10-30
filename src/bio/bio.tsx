import * as React from 'react';
import Container from '@material-ui/core/Container';
import { Paper, Box } from '@material-ui/core';
import { ASSETS_PATH } from '../assets/constants';

import './bio.scss';

export const Bio: React.FC = () => {
  const imageSrc = `${ASSETS_PATH}/bio.jpg`;
  return (
    <Container maxWidth="md" className="Bio-container">
      <Box component={Paper} p={2}>
        <img src={imageSrc} alt="Bio" className="bio-image" />
        <p>
          Meruyert Tulenova was born in Almaty, Kazakhstan. She started her
          musical education at the age of six at the Akhmet Jubanov School of
          Music for Gifted Children and Youth. During her studies, she
          participated in national and international competitions and won
          numerous awards.
        </p>
        <p>
          After graduating with honors, she joined the Kurmangazy Kazakh
          National Conservatory, During her studies she attended masterclasses
          by several well-known musicians. She has performed to great success in
          many cities in Kazakhstan, Europe and the Americas under the guidance
          of local and foreign conductors. She was awarded a Presidential
          Scholarship for her outstanding achievements.
        </p>
        <p>
          She is currently studying at the academy of music Hanns Eisler
          in Berlin. She is participating in master classes and concerts, both
          as a soloist and as a member of the ensemble. Meruyert Tulenova is a
          member of the ensemble for contemporary music EEGERU. She has won
          prizes at international competitions in Romania, Hungary, Russia and
          Kazakhstan.
        </p>
      </Box>
    </Container>
  );
};

export default Bio;
