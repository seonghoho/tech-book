import { preload } from "react-dom";
import { homeHeroMainImages } from "@/lib/homeContent";
import HeroPlaygroundClient from "./HeroPlaygroundClient";

export default function HeroPlayground() {
  const initialImageSrc = homeHeroMainImages[0];

  if (initialImageSrc) {
    preload(initialImageSrc, { as: "image" });
  }

  return <HeroPlaygroundClient />;
}
