import { useEffect, useState } from 'react';
import { imageItems, homeSlideshowStartPhoto, photoDisplayOrder } from '../media/photos/utils';

export const homeMediaPhotos = imageItems.map((item) => item.img);

export const INTRO_DURATION_MS = 15 * 1000;
export const DESCRIPTION_DELAY_MS = 3 * 1000;
const ROTATION_MS = 15 * 1000;
const INITIAL_PHOTO_INDEX = photoDisplayOrder.indexOf(homeSlideshowStartPhoto);

const preloadPhotos = (): void => {
  homeMediaPhotos.forEach((src) => {
    const image = new Image();
    image.src = src;
  });
};

export const useHomeBackground = (): {
  photoIndex: number | null;
  showIntro: boolean;
  showDescription: boolean;
} => {
  const [photoIndex, setPhotoIndex] = useState<number | null>(null);
  const [slideshowActive, setSlideshowActive] = useState(false);
  const [descriptionReady, setDescriptionReady] = useState(false);

  useEffect(() => {
    preloadPhotos();
  }, []);

  useEffect(() => {
    const descriptionTimer = window.setTimeout(() => {
      setDescriptionReady(true);
    }, DESCRIPTION_DELAY_MS);

    return () => window.clearTimeout(descriptionTimer);
  }, []);

  useEffect(() => {
    const startTimer = window.setTimeout(() => {
      setSlideshowActive(true);
      setPhotoIndex(INITIAL_PHOTO_INDEX);
    }, INTRO_DURATION_MS);

    return () => window.clearTimeout(startTimer);
  }, []);

  useEffect(() => {
    if (!slideshowActive) {
      return undefined;
    }

    const rotateTimer = window.setInterval(() => {
      setPhotoIndex((current) => ((current ?? INITIAL_PHOTO_INDEX) + 1) % homeMediaPhotos.length);
    }, ROTATION_MS);

    return () => window.clearInterval(rotateTimer);
  }, [slideshowActive]);

  return {
    photoIndex,
    showIntro: !slideshowActive,
    showDescription: !slideshowActive && descriptionReady,
  };
};
