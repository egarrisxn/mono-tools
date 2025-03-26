"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, SkipForward, SkipBack, Trash2, Plus, Film } from "lucide-react";
import { Button } from "@repo/ui/src/components/button";
import { Input } from "@repo/ui/src/components/input";
import { Slider } from "@repo/ui/src/components/slider";
import { getYouTubePlayer } from "@/utils/youtube";
import { OnErrorEvent, OnStateChangeEvent, Player, PlayerState } from "@/types/youtube";

interface Movie {
  id: string;
  title: string;
  url: string;
}

export default function MoviePlayer({
  isBreakTime = false,
  onClose,
}: {
  isBreakTime?: boolean;
  onClose?: () => void;
}) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [currentMovieIndex, setCurrentMovieIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [newMovieUrl, setNewMovieUrl] = useState("");
  const [volume, setVolume] = useState(70);
  const playerRef = useRef<Player | null>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedMovies = localStorage.getItem("breakMovies");
      if (savedMovies) {
        setMovies(JSON.parse(savedMovies));
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("breakMovies", JSON.stringify(movies));
    }
  }, [movies]);

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
      playerDiv.id = "movie-player";
      playerDiv.style.display = "none";

      if (playerContainerRef.current) {
        playerContainerRef.current.appendChild(playerDiv);

        playerRef.current = getYouTubePlayer("movie-player", {
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
                playNextMovie();
              } else if (event.data === PlayerState.PLAYING) {
                setIsPlaying(true);
              } else if (event.data === PlayerState.PAUSED) {
                setIsPlaying(false);
              }
            },
            onError: (event: OnErrorEvent) => {
              console.error("YouTube player error:", event.data);
              playNextMovie();
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

  useEffect(() => {
    if (isBreakTime && movies.length > 0 && currentMovieIndex === -1) {
      setCurrentMovieIndex(0);
    }
  }, [isBreakTime, movies, currentMovieIndex]);

  const extractVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2] && match[2].length === 11 ? match[2] : null;
  };

  const extractTitle = (url: string): string => {
    const videoId = extractVideoId(url);
    return videoId ? `Movie (${videoId.substring(0, 6)}...)` : "Unknown Movie";
  };

  const addMovie = () => {
    if (!newMovieUrl.trim()) return;

    const movieId = extractVideoId(newMovieUrl);

    if (!movieId) {
      alert("Invalid YouTube URL");
      return;
    }

    const title = extractTitle(newMovieUrl);
    const newMovie: Movie = {
      id: movieId,
      title,
      url: newMovieUrl,
    };

    setMovies([...movies, newMovie]);
    setNewMovieUrl("");

    if (movies.length === 0) {
      setCurrentMovieIndex(0);
    }
  };

  const removeMovie = (index: number) => {
    const newMovies = [...movies];
    newMovies.splice(index, 1);
    setMovies(newMovies);

    if (index === currentMovieIndex) {
      if (isPlaying && playerRef.current) {
        playerRef.current.stopVideo();
        setIsPlaying(false);
      }
      if (newMovies.length > 0) {
        setCurrentMovieIndex(0);
      } else {
        setCurrentMovieIndex(-1);
      }
    } else if (index < currentMovieIndex) {
      setCurrentMovieIndex(currentMovieIndex - 1);
    }
  };

  const loadAndPlayMovie = (index: number) => {
    if (!movies[index] || !playerRef.current) return;

    const movie = movies[index];
    const videoId = extractVideoId(movie.url);

    if (videoId) {
      playerRef.current.loadVideoById(videoId);
      playerRef.current.setVolume(volume);
      setIsPlaying(true);
    }
  };

  const togglePlay = () => {
    if (currentMovieIndex === -1 && movies.length > 0) {
      setCurrentMovieIndex(0);
      loadAndPlayMovie(0);
      return;
    }

    if (!movies[currentMovieIndex]) return;

    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    }

    setIsPlaying(!isPlaying);
  };

  const playPreviousMovie = () => {
    if (movies.length === 0) return;

    const newIndex = currentMovieIndex <= 0 ? movies.length - 1 : currentMovieIndex - 1;
    setCurrentMovieIndex(newIndex);
    loadAndPlayMovie(newIndex);
  };

  const playNextMovie = () => {
    if (movies.length === 0) return;

    const newIndex = (currentMovieIndex + 1) % movies.length;
    setCurrentMovieIndex(newIndex);
    loadAndPlayMovie(newIndex);
  };

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.setVolume(volume);
    }
  }, [volume]);

  useEffect(() => {
    if (currentMovieIndex >= 0 && playerRef.current) {
      loadAndPlayMovie(currentMovieIndex);
    }
  }, [currentMovieIndex]);

  return (
    <div className="shadow-xs mx-auto flex w-full max-w-md flex-col space-y-3 rounded-lg border p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-primary/80 text-lg font-medium">(break movies)</h2>
        {isBreakTime && onClose && (
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-primary/50 hover:text-primary/70 hover:bg-primary/10 h-7 px-2"
          >
            Close
          </Button>
        )}
      </div>

      {/* Player container */}
      <div ref={playerContainerRef} className="hidden"></div>

      <div className="flex space-x-2">
        <Input
          value={newMovieUrl}
          onChange={(e) => setNewMovieUrl(e.target.value)}
          placeholder="Paste YouTube movie URL"
          className="bg-background/50 text-primary placeholder:text-primary/30 h-8 grow border text-sm"
        />
        <Button
          onClick={addMovie}
          className="bg-primary/10 text-primary hover:bg-primary/30 size-8 border-none p-0"
        >
          <Plus className="size-4" />
        </Button>
      </div>

      {/* Current movie info */}
      <div className="py-1 text-center">
        <p className="text-primary/80 truncate text-sm">
          {currentMovieIndex >= 0 && movies[currentMovieIndex]
            ? movies[currentMovieIndex].title
            : "No movie selected"}
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
          onClick={playPreviousMovie}
          variant="outline"
          size="icon"
          className="border-primary/30 text-primary/70 hover:bg-primary/10 hover:text-primary size-8 rounded-full border"
          disabled={movies.length === 0}
        >
          <SkipBack className="size-3" />
        </Button>

        <Button
          onClick={togglePlay}
          variant="outline"
          size="icon"
          className="border-primary/30 text-primary/70 hover:bg-primary/10 hover:text-primary size-8 rounded-full border"
          disabled={movies.length === 0}
        >
          {isPlaying ? <Pause className="size-3" /> : <Play className="size-3" />}
        </Button>

        <Button
          onClick={playNextMovie}
          variant="outline"
          size="icon"
          className="border-primary/30 text-primary/70 hover:bg-primary/10 hover:text-primary size-8 rounded-full border"
          disabled={movies.length === 0}
        >
          <SkipForward className="size-3" />
        </Button>
      </div>

      {/* Movie list */}
      <div className="mt-2 max-h-32 space-y-1 overflow-y-auto">
        {movies.length === 0 ? (
          <p className="text-primary/50 text-center text-sm italic">No movies added</p>
        ) : (
          movies.map((movie, index) => (
            <div
              key={movie.id}
              className={`group flex items-center justify-between rounded p-1.5 ${
                index === currentMovieIndex ? "bg-primary/10" : ""
              }`}
            >
              <div
                className="text-primary/70 hover:text-primary/90 flex flex-1 cursor-pointer items-center gap-1 truncate text-xs"
                onClick={() => {
                  setCurrentMovieIndex(index);
                }}
              >
                <Film className="size-3 shrink-0" />
                <span>{movie.title}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeMovie(index)}
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

// "use client";

// import { useState, useEffect, useRef } from "react";
// import { Trash2, Plus, Film } from "lucide-react";
// import { Button } from "@repo/ui/src/components/button";
// import { Input } from "@repo/ui/src/components/input";
// import { getYouTubePlayer } from "@/utils/youtube";

// interface Movie {
//   id: string;
//   title: string;
//   url: string;
// }

// export default function MoviePlayer({
//   isBreakTime = false,
//   onClose,
// }: {
//   isBreakTime?: boolean;
//   onClose?: () => void;
// }) {
//   const [movies, setMovies] = useState<Movie[]>([]);
//   const [currentMovieIndex, setCurrentMovieIndex] = useState<number>(-1);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [newMovieUrl, setNewMovieUrl] = useState("");
//   const playerRef = useRef<any>(null);
//   const playerContainerRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       const savedMovies = localStorage.getItem("breakMovies");
//       if (savedMovies) {
//         setMovies(JSON.parse(savedMovies));
//       }
//     }
//   }, []);

//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       localStorage.setItem("breakMovies", JSON.stringify(movies));
//     }
//   }, [movies]);

//   useEffect(() => {
//     if (!window.YT) {
//       const tag = document.createElement("script");
//       tag.src = "https://www.youtube.com/iframe_api";
//       const firstScriptTag = document.getElementsByTagName("script")[0];
//       firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
//     }

//     if (!window.onYouTubeIframeAPIReady) {
//       window.onYouTubeIframeAPIReady = () => {
//         initializePlayer();
//       };
//     } else if (window.YT && typeof window.YT.Player === "function") {
//       initializePlayer();
//     }

//     return () => {
//       if (playerRef.current) {
//         playerRef.current.destroy();
//       }
//     };
//   }, []);

//   useEffect(() => {
//     if (isBreakTime && movies.length > 0 && currentMovieIndex === -1) {
//       setCurrentMovieIndex(0);
//     }
//   }, [isBreakTime, movies, currentMovieIndex]);

//   const initializePlayer = () => {
//     if (!document.getElementById("movie-player") && playerContainerRef.current) {
//       const playerDiv = document.createElement("div");
//       playerDiv.id = "movie-player";
//       playerContainerRef.current.appendChild(playerDiv);

//       playerRef.current = getYouTubePlayer("movie-player", {
//         height: "180",
//         width: "320",
//         playerVars: {
//           playsinline: 1,
//           controls: 1,
//           disablekb: 0,
//         },
//         events: {
//           onStateChange: (event: any) => {
//             if (event.data === window.YT.PlayerState.ENDED) {
//               if (currentMovieIndex < movies.length - 1) {
//                 setCurrentMovieIndex(currentMovieIndex + 1);
//               } else {
//                 setIsPlaying(false);
//               }
//             } else if (event.data === window.YT.PlayerState.PLAYING) {
//               setIsPlaying(true);
//             } else if (event.data === window.YT.PlayerState.PAUSED) {
//               setIsPlaying(false);
//             }
//           },
//         },
//       });
//     }
//   };

//   const extractVideoId = (url: string): string | null => {
//     const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
//     const match = url.match(regExp);
//     return match && match[2].length === 11 ? match[2] : null;
//   };

//   const extractTitle = (url: string): string => {
//     const videoId = extractVideoId(url);
//     return videoId ? `Movie (${videoId.substring(0, 6)}...)` : "Unknown Movie";
//   };

//   const addMovie = () => {
//     if (!newMovieUrl.trim()) return;

//     let movieId: string | null = null;
//     movieId = extractVideoId(newMovieUrl);

//     if (!movieId) {
//       alert("Invalid YouTube URL");
//       return;
//     }

//     const title = extractTitle(newMovieUrl);
//     const newMovie: Movie = {
//       id: movieId,
//       title,
//       url: newMovieUrl,
//     };

//     setMovies([...movies, newMovie]);
//     setNewMovieUrl("");

//     if (movies.length === 0) {
//       setCurrentMovieIndex(0);
//     }
//   };

//   const removeMovie = (index: number) => {
//     const newMovies = [...movies];
//     newMovies.splice(index, 1);
//     setMovies(newMovies);

//     if (index === currentMovieIndex) {
//       if (isPlaying && playerRef.current) {
//         playerRef.current.stopVideo();
//         setIsPlaying(false);
//       }
//       if (newMovies.length > 0) {
//         setCurrentMovieIndex(0);
//       } else {
//         setCurrentMovieIndex(-1);
//       }
//     } else if (index < currentMovieIndex) {
//       setCurrentMovieIndex(currentMovieIndex - 1);
//     }
//   };

//   const loadAndPlayMovie = (index: number) => {
//     if (!movies[index] || !playerRef.current) return;

//     const movie = movies[index];
//     const videoId = extractVideoId(movie.url);

//     if (videoId) {
//       playerRef.current.loadVideoById(videoId);
//       setIsPlaying(true);
//     }
//   };

//   useEffect(() => {
//     if (currentMovieIndex >= 0 && playerRef.current) {
//       loadAndPlayMovie(currentMovieIndex);
//     }
//   }, [currentMovieIndex]);

//   return (
//     <div className="bg-background/30 border-primary/20 mx-auto flex w-full max-w-md flex-col space-y-3 rounded-lg border p-6 shadow-xs">
//       <div className="flex items-center justify-between">
//         <h2 className="text-primary/80 text-lg font-medium">(break movies)</h2>
//         {isBreakTime && onClose && (
//           <Button
//             onClick={onClose}
//             variant="ghost"
//             size="sm"
//             className="text-primary/50 hover:text-primary/70 hover:bg-primary/10 h-7 px-2"
//           >
//             Close
//           </Button>
//         )}
//       </div>

//       {/* Player container */}
//       <div
//         ref={playerContainerRef}
//         className="bg-background/50 aspect-video w-full overflow-hidden rounded"
//       ></div>

//       <div className="flex space-x-2">
//         <Input
//           value={newMovieUrl}
//           onChange={(e) => setNewMovieUrl(e.target.value)}
//           placeholder="Paste YouTube movie URL"
//           className="border-primary/20 bg-background/50 text-primary placeholder:text-primary/30 h-8 grow text-sm"
//         />
//         <Button
//           onClick={addMovie}
//           className="bg-primary/10 text-primary/70 hover:bg-primary/20 size-8 border-none p-0"
//         >
//           <Plus className="size-3" />
//         </Button>
//       </div>

//       {/* Movie list */}
//       <div className="mt-2 max-h-32 space-y-1 overflow-y-auto">
//         {movies.length === 0 ? (
//           <p className="text-primary/30 text-center text-xs italic">No movies added</p>
//         ) : (
//           movies.map((movie, index) => (
//             <div
//               key={movie.id}
//               className={`group flex items-center justify-between rounded p-1.5 ${
//                 index === currentMovieIndex ? "bg-primary/10" : ""
//               }`}
//             >
//               <div
//                 className="text-primary/70 hover:text-primary/90 flex flex-1 cursor-pointer items-center gap-1 truncate text-xs"
//                 onClick={() => {
//                   setCurrentMovieIndex(index);
//                 }}
//               >
//                 <Film className="size-3 shrink-0" />
//                 <span>{movie.title}</span>
//               </div>
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 onClick={() => removeMovie(index)}
//                 className="text-primary/40 hover:text-primary/60 size-6 opacity-0 group-hover:opacity-100 hover:bg-transparent"
//               >
//                 <Trash2 className="size-3" />
//               </Button>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// }
