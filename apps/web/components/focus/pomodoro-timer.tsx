"use client";

import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Settings, Film } from "lucide-react";
import { Button } from "@repo/ui/src/components/button";
import { Slider } from "@repo/ui/src/components/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/src/components/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/src/components/select";
import { Label } from "@repo/ui/src/components/label";
import { Switch } from "@repo/ui/src/components/switch";
import MoviePlayer from "./movie-player";

type TimerMode = "work" | "break";
type TimerPreset = "25/5" | "50/10" | "90/20" | "custom";

interface TimerSettings {
  workTime: number;
  breakTime: number;
  preset: TimerPreset;
  enableMovieBreaks: boolean;
}

const DEFAULT_SETTINGS: TimerSettings = {
  workTime: 50 * 60,
  breakTime: 10 * 60,
  preset: "50/10",
  enableMovieBreaks: false,
};

export default function PomodoroTimer() {
  const loadSettings = (): TimerSettings => {
    if (typeof window === "undefined") return DEFAULT_SETTINGS;

    const saved = localStorage.getItem("pomodoroSettings");
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  };

  const [settings, setSettings] = useState<TimerSettings>(loadSettings());
  const [timeLeft, setTimeLeft] = useState(settings.workTime);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<TimerMode>("work");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [customWorkTime, setCustomWorkTime] = useState(50);
  const [customBreakTime, setCustomBreakTime] = useState(10);
  const [showMoviePlayer, setShowMoviePlayer] = useState(false);

  useEffect(() => {
    const savedSettings = loadSettings();
    setSettings(savedSettings);
    setTimeLeft(savedSettings.workTime);
    setCustomWorkTime(Math.floor(savedSettings.workTime / 60));
    setCustomBreakTime(Math.floor(savedSettings.breakTime / 60));
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("pomodoroSettings", JSON.stringify(settings));
    }
  }, [settings]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      if (soundEnabled) {
        const audio = new Audio("/notification.mp3");
        audio.play().catch((err) => console.error("Error playing sound:", err));
      }

      // Switch modes
      if (mode === "work") {
        setMode("break");
        setTimeLeft(settings.breakTime);

        // Show movie player if enabled
        if (settings.enableMovieBreaks) {
          setShowMoviePlayer(true);
        }
      } else {
        setMode("work");
        setTimeLeft(settings.workTime);
        setShowMoviePlayer(false);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, mode, soundEnabled, settings]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setMode("work");
    setTimeLeft(settings.workTime);
    setShowMoviePlayer(false);
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const calculateProgress = () => {
    const total = mode === "work" ? settings.workTime : settings.breakTime;
    return ((total - timeLeft) / total) * 100;
  };

  const applyPreset = (preset: TimerPreset) => {
    let newSettings: TimerSettings;

    switch (preset) {
      case "25/5":
        newSettings = {
          workTime: 25 * 60,
          breakTime: 5 * 60,
          preset,
          enableMovieBreaks: settings.enableMovieBreaks,
        };
        break;
      case "50/10":
        newSettings = {
          workTime: 50 * 60,
          breakTime: 10 * 60,
          preset,
          enableMovieBreaks: settings.enableMovieBreaks,
        };
        break;
      case "90/20":
        newSettings = {
          workTime: 90 * 60,
          breakTime: 20 * 60,
          preset,
          enableMovieBreaks: settings.enableMovieBreaks,
        };
        break;
      case "custom":
        newSettings = {
          workTime: customWorkTime * 60,
          breakTime: customBreakTime * 60,
          preset: "custom",
          enableMovieBreaks: settings.enableMovieBreaks,
        };
        break;
      default:
        newSettings = DEFAULT_SETTINGS;
    }

    setSettings(newSettings);

    // Reset timer with new settings
    setIsActive(false);
    setMode("work");
    setTimeLeft(newSettings.workTime);
  };

  const toggleMovieBreaks = (enabled: boolean) => {
    setSettings({
      ...settings,
      enableMovieBreaks: enabled,
    });

    if (!enabled && showMoviePlayer) {
      setShowMoviePlayer(false);
    }
  };

  return (
    <div className="shadow-xs mx-auto flex w-full max-w-md flex-col items-center space-y-4 rounded-lg border p-6">
      <div className="w-full">
        <div className="bg-primary/30 relative h-1.5 overflow-hidden rounded-full">
          <div
            className="bg-primary/80 absolute left-0 top-0 h-full"
            style={{ width: `${calculateProgress()}%` }}
          ></div>
        </div>
      </div>

      <div className="text-center">
        <div className="text-5xl font-medium">{formatTime(timeLeft)}</div>
        <div className="text-primary/50 mt-1 text-xs uppercase tracking-wider">
          {mode === "work" ? "focus" : "break"}
        </div>
      </div>

      <div className="flex space-x-3">
        <Button
          onClick={toggleTimer}
          variant="outline"
          size="icon"
          className="border-primary/30 text-primary/70 hover:bg-primary/10 hover:text-primary size-9 rounded-full border"
        >
          {isActive ? <Pause className="size-4" /> : <Play className="size-4" />}
        </Button>

        <Button
          onClick={resetTimer}
          variant="outline"
          size="icon"
          className="border-primary/30 text-primary/70 hover:bg-primary/10 hover:text-primary size-9 rounded-full border"
        >
          <RotateCcw className="size-4" />
        </Button>

        <Button
          onClick={toggleSound}
          variant="outline"
          size="icon"
          className="border-primary/30 text-primary/70 hover:bg-primary/10 hover:text-primary size-9 rounded-full border"
        >
          {soundEnabled ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
        </Button>

        {settings.enableMovieBreaks && mode === "break" && (
          <Button
            onClick={() => setShowMoviePlayer(!showMoviePlayer)}
            variant="outline"
            size="icon"
            className="border-primary/30 text-primary/70 hover:bg-primary/10 hover:text-primary size-9 rounded-full border"
          >
            <Film className="size-4" />
          </Button>
        )}

        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="border-primary/30 text-primary/70 hover:bg-primary/10 hover:text-primary size-9 rounded-full border opacity-60 transition-opacity hover:opacity-100"
            >
              <Settings className="size-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-background text-primary border">
            <DialogHeader>
              <DialogTitle className="text-primary/80">Timer Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label className="text-primary/70">Preset Timers</Label>
                <Select
                  value={settings.preset}
                  onValueChange={(value) => applyPreset(value as TimerPreset)}
                >
                  <SelectTrigger className="text-primary/80 bg-background border">
                    <SelectValue placeholder="Select a preset" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-primary/30">
                    <SelectItem value="25/5">25/5 (Pomodoro)</SelectItem>
                    <SelectItem value="50/10">50/10 (Extended)</SelectItem>
                    <SelectItem value="90/20">90/20 (Deep Work)</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {settings.preset === "custom" && (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-primary/70">Work Time: {customWorkTime} minutes</Label>
                    </div>
                    <Slider
                      value={[customWorkTime]}
                      min={5}
                      max={120}
                      step={5}
                      onValueChange={(value) => {
                        if (value[0] !== undefined) {
                          setCustomWorkTime(value[0]);
                        }
                      }}
                      className="text-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-primary/70">
                        Break Time: {customBreakTime} minutes
                      </Label>
                    </div>
                    <Slider
                      value={[customBreakTime]}
                      min={1}
                      max={30}
                      step={1}
                      onValueChange={(value) => {
                        if (value[0] !== undefined) {
                          setCustomBreakTime(value[0]);
                        }
                      }}
                      className="text-primary"
                    />
                  </div>
                  <Button
                    onClick={() => applyPreset("custom")}
                    className="bg-primary/10 text-primary/80 hover:bg-primary/20 border-primary/30 w-full border"
                  >
                    Apply Custom Settings
                  </Button>
                </>
              )}

              <div className="flex items-center justify-between space-x-2 pt-2">
                <Label htmlFor="movie-breaks" className="text-primary/70">
                  Enable Movie Breaks
                </Label>
                <Switch
                  id="movie-breaks"
                  checked={settings.enableMovieBreaks}
                  onCheckedChange={toggleMovieBreaks}
                  className="data-[state=checked]:bg-primary/70"
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {showMoviePlayer && mode === "break" && (
        <div className="mt-4 w-full">
          <MoviePlayer isBreakTime={true} onClose={() => setShowMoviePlayer(false)} />
        </div>
      )}
    </div>
  );
}
