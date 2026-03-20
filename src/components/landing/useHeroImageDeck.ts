"use client";

import { startTransition, useEffect, useRef, useState } from "react";

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

const primedImagePromises = new Map<string, Promise<void>>();

function primeImage(src: string) {
  if (!src || typeof window === "undefined") {
    return Promise.resolve();
  }

  const cachedPromise = primedImagePromises.get(src);

  if (cachedPromise) {
    return cachedPromise;
  }

  const image = new window.Image();
  image.decoding = "async";
  image.src = src;

  const nextPromise =
    typeof image.decode === "function"
      ? image.decode().catch(() => undefined)
      : new Promise<void>((resolve) => {
          image.onload = () => resolve();
          image.onerror = () => resolve();
        });

  primedImagePromises.set(src, nextPromise);

  return nextPromise;
}

function getNextDeckState(currentDeck: HeroImageDeckState) {
  if (currentDeck.upcomingImages.length > 0) {
    const [nextImage, ...nextUpcomingImages] = currentDeck.upcomingImages;

    return {
      currentImageSrc: nextImage,
      upcomingImages: nextUpcomingImages,
      seenImages: [...currentDeck.seenImages, currentDeck.currentImageSrc],
    } satisfies HeroImageDeckState;
  }

  const reshuffledImages = shuffleImages([currentDeck.currentImageSrc, ...currentDeck.seenImages]);
  const [nextImage, ...nextUpcomingImages] = reshuffledImages;

  return {
    currentImageSrc: nextImage ?? currentDeck.currentImageSrc,
    upcomingImages: nextUpcomingImages,
    seenImages: [],
  } satisfies HeroImageDeckState;
}

export function useHeroImageDeck(images: readonly string[], fallbackImage: string) {
  const uniqueImages = getUniqueImages(images);
  const uniqueImagesKey = uniqueImages.join("::");
  const initialCurrentImage = uniqueImages[0] ?? fallbackImage;
  const deckRef = useRef<HeroImageDeckState>({
    currentImageSrc: initialCurrentImage,
    upcomingImages: [],
    seenImages: [],
  });
  const [deck, setDeck] = useState<HeroImageDeckState>(() => ({
    currentImageSrc: initialCurrentImage,
    upcomingImages: [],
    seenImages: [],
  }));
  const [isAdvancePending, setIsAdvancePending] = useState(false);

  useEffect(() => {
    const nextCurrentImage = uniqueImages[0] ?? fallbackImage;
    const nextUpcomingImages = shuffleImages(uniqueImages.filter((image) => image !== nextCurrentImage));
    const nextDeck = {
      currentImageSrc: nextCurrentImage,
      upcomingImages: nextUpcomingImages,
      seenImages: [],
    } satisfies HeroImageDeckState;

    deckRef.current = nextDeck;
    setDeck(nextDeck);
    void Promise.all([nextCurrentImage, ...nextUpcomingImages.slice(0, 2)].map(primeImage));
  }, [fallbackImage, uniqueImagesKey]);

  useEffect(() => {
    deckRef.current = deck;
    void Promise.all([deck.currentImageSrc, ...deck.upcomingImages.slice(0, 2)].map(primeImage));
  }, [deck]);

  const advanceImage = () => {
    if (uniqueImages.length <= 1 || isAdvancePending) {
      return;
    }

    const nextDeck = getNextDeckState(deckRef.current);

    if (nextDeck.currentImageSrc === deckRef.current.currentImageSrc) {
      return;
    }

    setIsAdvancePending(true);

    void primeImage(nextDeck.currentImageSrc).finally(() => {
      startTransition(() => {
        deckRef.current = nextDeck;
        setDeck(nextDeck);
        setIsAdvancePending(false);
      });
      void Promise.all(nextDeck.upcomingImages.slice(0, 2).map(primeImage));
    });
  };

  return {
    currentImageSrc: deck.currentImageSrc,
    advanceImage,
    isRefreshDisabled: uniqueImages.length <= 1 || isAdvancePending,
  };
}
