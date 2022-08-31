import { Box } from '@material-ui/core';
import { Photo } from './photo';

export const Photos: React.FC = () => {
  const photos = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  return (
    <Box mt={2} p={2} display="flex" justifyContent="center">
      {photos.map((value) => (
        <Photo key={value} />
      ))}
    </Box>
  );
};
