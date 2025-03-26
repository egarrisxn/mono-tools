"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, SkipForward, SkipBack, Trash2, Plus, Music } from "lucide-react";
import { Button } from "@repo/ui/src/components/button";
import { Input } from "@repo/ui/src/components/input";
import { Slider } from "@repo/ui/src/components/slider";
import { getYouTubePlayer } from "@/utils/youtube";
import { OnErrorEvent, OnStateChangeEvent, Player, PlayerState } from "@/types/youtube";

interface Track {
  id: string;
  title: string;
  url: string;
}

export default function MusicPlayer() {
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [newTrackUrl, setNewTrackUrl] = useState("");
  const [volume, setVolume] = useState(70);
  const playerRef = useRef<Player | null>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPlaylist = localStorage.getItem("musicPlaylist");
      if (savedPlaylist) {
        setPlaylist(JSON.parse(savedPlaylist));
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("musicPlaylist", JSON.stringify(playlist));
    }
  }, [playlist]);

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }
    }

    window.onYouTubeIframeAPIReady = () => {
      // const YT = window.YT;

      const playerDiv = document.createElement("div");
      playerDiv.id = "youtube-player";
      playerDiv.style.display = "none";

      if (playerContainerRef.current) {
        playerContainerRef.current.appendChild(playerDiv);

        playerRef.current = getYouTubePlayer("youtube-player", {
          height: "0",
          width: "0",
          playerVars: {
            playsinline: 1,
            controls: 0,
            disablekb: 1,
          },
          events: {
            onStateChange: (event: OnStateChangeEvent) => {
              if (event.data === PlayerState.ENDED) {
                playNextTrack();
              }
            },
            onError: (event: OnErrorEvent) => {
              console.error("YouTube player error:", event.data);
              playNextTrack();
            },
          },
        });
      }
    };

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, []);

  const extractVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2] && match[2].length === 11 ? match[2] : null;
  };

  const extractTitle = (url: string): string => {
    const videoId = extractVideoId(url);
    return videoId ? `YouTube (${videoId.substring(0, 6)}...)` : "Unknown Track";
  };

  const addTrack = async () => {
    if (!newTrackUrl.trim()) return;

    let trackId: string | null = null;
    trackId = extractVideoId(newTrackUrl);

    if (!trackId) {
      alert("Invalid YouTube URL");
      return;
    }

    const title = extractTitle(newTrackUrl);
    const newTrack: Track = {
      id: trackId,
      title,
      url: newTrackUrl,
    };

    setPlaylist([...playlist, newTrack]);
    setNewTrackUrl("");

    if (playlist.length === 0) {
      setCurrentTrackIndex(0);
    }
  };

  const removeTrack = (index: number) => {
    const newPlaylist = [...playlist];
    newPlaylist.splice(index, 1);
    setPlaylist(newPlaylist);

    if (index === currentTrackIndex) {
      if (isPlaying) {
        playerRef.current?.stopVideo();
        setIsPlaying(false);
      }
      if (newPlaylist.length > 0) {
        setCurrentTrackIndex(0);
      } else {
        setCurrentTrackIndex(-1);
      }
    } else if (index < currentTrackIndex) {
      setCurrentTrackIndex(currentTrackIndex - 1);
    }
  };

  const togglePlay = () => {
    if (currentTrackIndex === -1 && playlist.length > 0) {
      setCurrentTrackIndex(0);
      loadAndPlayTrack(0);
      return;
    }

    if (!playlist[currentTrackIndex]) return;

    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    }

    setIsPlaying(!isPlaying);
  };

  const loadAndPlayTrack = (index: number) => {
    if (!playlist[index]) return;

    const track = playlist[index];

    if (playerRef.current) {
      const videoId = extractVideoId(track.url);
      if (videoId) {
        playerRef.current.loadVideoById(videoId);
        playerRef.current.setVolume(volume);
        setIsPlaying(true);
      }
    }
  };

  const playPreviousTrack = () => {
    if (playlist.length === 0) return;

    const newIndex = currentTrackIndex <= 0 ? playlist.length - 1 : currentTrackIndex - 1;
    setCurrentTrackIndex(newIndex);
    loadAndPlayTrack(newIndex);
  };

  const playNextTrack = () => {
    if (playlist.length === 0) return;

    const newIndex = (currentTrackIndex + 1) % playlist.length;
    setCurrentTrackIndex(newIndex);
    loadAndPlayTrack(newIndex);
  };

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.setVolume(volume);
    }
  }, [volume]);

  useEffect(() => {
    if (currentTrackIndex >= 0) {
      loadAndPlayTrack(currentTrackIndex);
    }
  }, [currentTrackIndex, playlist]);

  return (
    <div className="shadow-xs mx-auto flex w-full max-w-md flex-col space-y-3 rounded-lg border p-6">
      <h2 className="text-primary/80 text-center text-lg font-medium">(music)</h2>

      {/* Hidden player container */}
      <div ref={playerContainerRef} className="hidden"></div>

      <div className="flex space-x-2">
        <Input
          value={newTrackUrl}
          onChange={(e) => setNewTrackUrl(e.target.value)}
          placeholder="Paste YouTube URL"
          className="bg-background/50 text-primary placeholder:text-primary/30 h-8 grow border text-sm"
        />
        <Button
          onClick={addTrack}
          className="bg-primary/10 text-primary hover:bg-primary/30 size-8 border-none p-0"
        >
          <Plus className="size-4" />
        </Button>
      </div>

      {/* Current track info */}
      <div className="py-1 text-center">
        <p className="text-primary/80 truncate text-sm">
          {currentTrackIndex >= 0 && playlist[currentTrackIndex]
            ? playlist[currentTrackIndex].title
            : "No track selected"}
        </p>
      </div>

      {/* Volume slider */}
      <div className="space-y-1">
        <Slider
          value={[volume]}
          min={0}
          max={100}
          step={1}
          onValueChange={(value) => setVolume(value[0] ?? 0)}
          className="h-1.5"
        />
        <p className="text-primary/50 text-right text-xs">Vol: {volume}%</p>
      </div>

      {/* Playback controls */}
      <div className="flex justify-center space-x-3">
        <Button
          onClick={playPreviousTrack}
          variant="outline"
          size="icon"
          className="border-primary/30 text-primary/70 hover:bg-primary/10 hover:text-primary size-8 rounded-full border"
          disabled={playlist.length === 0}
        >
          <SkipBack className="size-3" />
        </Button>

        <Button
          onClick={togglePlay}
          variant="outline"
          size="icon"
          className="border-primary/30 text-primary/70 hover:bg-primary/10 hover:text-primary size-8 rounded-full border"
          disabled={playlist.length === 0}
        >
          {isPlaying ? <Pause className="size-3" /> : <Play className="size-3" />}
        </Button>

        <Button
          onClick={playNextTrack}
          variant="outline"
          size="icon"
          className="border-primary/30 text-primary/70 hover:bg-primary/10 hover:text-primary size-8 rounded-full border"
          disabled={playlist.length === 0}
        >
          <SkipForward className="size-3" />
        </Button>
      </div>

      {/* Playlist */}
      <div className="mt-2 max-h-32 space-y-1 overflow-y-auto">
        {playlist.length === 0 ? (
          <p className="text-primary/50 text-center text-sm italic">No tracks added</p>
        ) : (
          playlist.map((track, index) => (
            <div
              key={track.id}
              className={`group flex items-center justify-between rounded p-1.5 ${
                index === currentTrackIndex ? "bg-primary/10" : ""
              }`}
            >
              <div
                className="text-primary/70 hover:text-primary/90 flex flex-1 cursor-pointer items-center gap-1 truncate text-xs"
                onClick={() => {
                  setCurrentTrackIndex(index);
                  loadAndPlayTrack(index);
                }}
              >
                <Music className="size-3 shrink-0" />
                <span>{track.title}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeTrack(index)}
                className="text-primary/50 hover:text-primary/70 size-6 opacity-0 hover:bg-transparent group-hover:opacity-100"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
