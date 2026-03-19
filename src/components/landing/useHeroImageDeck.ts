"use client";

import { useEffect, useState } from "react";

export type HeroImageDeckState = {
  currentImageSrc: string;
  upcomingImages: string[];
  seenImages: string[];
};

function getUniqueImages(images: readonly string[]) {
  return Array.from(new Set(images.filter(Boolean)));
}

function shuffleImages(images: readonly string[]) {
  const nextImages = [...images];

  for (let index = nextImages.length - 1; index > 0; index -= 1) {
    const nextIndex = Math.floor(Math.random() * (index + 1));
    [nextImages[index], nextImages[nextIndex]] = [nextImages[nextIndex], nextImages[index]];
  }

  return nextImages;
}

export function useHeroImageDeck(images: readonly string[], fallbackImage: string) {
  const uniqueImages = getUniqueImages(images);
  const uniqueImagesKey = uniqueImages.join("::");
  const initialCurrentImage = uniqueImages[0] ?? fallbackImage;
  const [deck, setDeck] = useState<HeroImageDeckState>(() => ({
    currentImageSrc: initialCurrentImage,
    upcomingImages: [],
    seenImages: [],
  }));

  useEffect(() => {
    const nextCurrentImage = uniqueImages[0] ?? fallbackImage;

    setDeck({
      currentImageSrc: nextCurrentImage,
      upcomingImages: shuffleImages(uniqueImages.filter((image) => image !== nextCurrentImage)),
      seenImages: [],
    });
  }, [fallbackImage, uniqueImagesKey]);

  const advanceImage = () => {
    if (uniqueImages.length <= 1) {
      return;
    }

    setDeck((currentDeck) => {
      if (currentDeck.upcomingImages.length > 0) {
        const [nextImage, ...nextUpcomingImages] = currentDeck.upcomingImages;

        return {
          currentImageSrc: nextImage,
          upcomingImages: nextUpcomingImages,
          seenImages: [...currentDeck.seenImages, currentDeck.currentImageSrc],
        };
      }

      const reshuffledImages = shuffleImages([currentDeck.currentImageSrc, ...currentDeck.seenImages]);
      const [nextImage, ...nextUpcomingImages] = reshuffledImages;

      return {
        currentImageSrc: nextImage ?? currentDeck.currentImageSrc,
        upcomingImages: nextUpcomingImages,
        seenImages: [],
      };
    });
  };

  return {
    currentImageSrc: deck.currentImageSrc,
    advanceImage,
    isRefreshDisabled: uniqueImages.length <= 1,
  };
}
