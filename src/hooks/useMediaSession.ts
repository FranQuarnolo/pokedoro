import { useEffect } from "react";

interface MediaSessionOptions {
  title: string;
  artist: string;
  artwork?: string;
  isPlaying: boolean;
  onPlay?: () => void;
  onPause?: () => void;
}

export const useMediaSession = ({
  title,
  artist,
  artwork,
  isPlaying,
  onPlay,
  onPause,
}: MediaSessionOptions) => {
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title,
      artist,
      album: "Pokedoro",
      artwork: artwork
        ? [{ src: artwork, sizes: "96x96", type: "image/png" }]
        : [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }],
    });
  }, [title, artist, artwork]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
  }, [isPlaying]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    if (onPlay) navigator.mediaSession.setActionHandler("play", onPlay);
    if (onPause) navigator.mediaSession.setActionHandler("pause", onPause);

    return () => {
      navigator.mediaSession.setActionHandler("play", null);
      navigator.mediaSession.setActionHandler("pause", null);
    };
  }, [onPlay, onPause]);
};
