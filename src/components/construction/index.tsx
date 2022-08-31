import { Player } from '@lottiefiles/react-lottie-player';
import * as animationData from './coming-soon.json';

export const Construction = () => {
  return <Player autoplay loop src={animationData} style={{ height: '100vh' }} />;
};
