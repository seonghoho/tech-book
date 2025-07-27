import dynamic from "next/dynamic";

export const GuideComponents = {
  "pixel-runner": dynamic(() => import("./pixel-runner/GameGuide"), {
    ssr: false,
  }),
  "space-shooter": dynamic(() => import("./space-shooter/GameGuide"), {
    ssr: false,
  }),
};
