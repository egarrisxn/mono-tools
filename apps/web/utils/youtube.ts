import { Player, PlayerOptions } from "../types/youtube";

export const getYouTubePlayer = (
  elementId: string | HTMLElement,
  options: PlayerOptions,
): Player => {
  return new (window.YT.Player as any)(elementId, options);
};
