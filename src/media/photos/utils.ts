import img1 from './assets/photo 1.jpg';
import img2 from './assets/photo 2.jpg';
import img3 from './assets/photo 3.jpg';
import img4 from './assets/photo 4.jpg';
import img5 from './assets/photo 5.jpg';
import img6 from './assets/photo 6.jpg';
import img7 from './assets/photo 7.jpg';
import img8 from './assets/photo 8.jpg';
import img9 from './assets/photo 9.jpg';
import img10 from './assets/photo 10.jpg';
import img11 from './assets/photo 11.jpg';
import img12 from './assets/photo 12.jpg';
import img13 from './assets/photo 13.jpg';
import img14 from './assets/photo 14.jpg';
import img15 from './assets/photo 15.jpg';
import img16 from './assets/photo 16.jpg';
import img17 from './assets/photo 17.jpg';
import img18 from './assets/photo 18.jpg';
import img19 from './assets/photo 19.jpg';
import img20 from './assets/photo 20.jpg';
import img21 from './assets/photo 21.jpg';
import img22 from './assets/photo 22.jpg';
import img23 from './assets/photo 23.jpg';
import img24 from './assets/photo 24.jpg';
import img25 from './assets/photo 25.jpg';
import img26 from './assets/photo 26.jpg';
import img27 from './assets/photo 27.jpg';
import img28 from './assets/photo 28.jpg';
import img29 from './assets/photo 29.jpg';
import img30 from './assets/photo 30.jpg';
import img31 from './assets/photo 31.jpg';
import img32 from './assets/photo 32.jpg';

const photosByNumber = [
  img1,
  img2,
  img3,
  img4,
  img5,
  img6,
  img7,
  img8,
  img9,
  img10,
  img11,
  img12,
  img13,
  img14,
  img15,
  img16,
  img17,
  img18,
  img19,
  img20,
  img21,
  img22,
  img23,
  img24,
  img25,
  img26,
  img27,
  img28,
  img29,
  img30,
  img31,
  img32,
];

export const photoDisplayOrder = [
  3, 4, 5, 9, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 1, 2, 6, 7, 8, 10, 11, 12, 13, 14,
];

export const homeSlideshowStartPhoto = 4;

export const imageItems = photoDisplayOrder.map((photoNumber) => ({
  img: photosByNumber[photoNumber - 1],
  cols: 1,
  title: 'Mira Tulenova',
}));

export interface IImageItem {
  img: string;
  cols: number;
  title: string;
}
