"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";

export default function Typing({ quotes }: { quotes: string[] }) {
  const [currentQuote, setCurrentQuote] = useState("");
  const [userInput, setUserInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [, setEndTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [liveWpm, setLiveWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isFinished, setIsFinished] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const wpmIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [cursorStyle, setCursorStyle] = useState({
    left: 0,
    top: 0,
    height: 0,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (textContainerRef.current) {
      const textContainer = textContainerRef.current;
      const chars = textContainer.querySelectorAll("span[data-char]");

      if (chars.length > 0 && currentPosition < chars.length) {
        const currentChar = chars[currentPosition];

        if (currentChar) {
          const rect = currentChar.getBoundingClientRect();
          const containerRect = textContainer.getBoundingClientRect();

          setCursorStyle({
            left: rect.left - containerRect.left,
            top: rect.top - containerRect.top,
            height: rect.height,
          });
        }
      }
    }
  }, [currentPosition, currentQuote, userInput]);
  const getRandomQuote = (): string => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex] || "";
  };

  const initGame = () => {
    setCurrentQuote(getRandomQuote());
    setUserInput("");
    setStartTime(null);
    setWpm(0);
    setLiveWpm(0);
    setAccuracy(100);
    setIsFinished(false);
    setIsStarted(false);
    setCurrentPosition(0);
    setCursorStyle({ left: 0, top: 0, height: 0 });

    if (wpmIntervalRef.current) {
      clearInterval(wpmIntervalRef.current);
      wpmIntervalRef.current = null;
    }
  };

  useEffect(() => {
    initGame();
    return () => {
      if (wpmIntervalRef.current) {
        clearInterval(wpmIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.focus();
    }
  }, [isFinished]);

  const calculateWPM = () => {
    if (!startTime || !isStarted) return 0;

    const timeInMinutes = (Date.now() - startTime) / 60000;
    const wordCount = userInput.length / 5;

    if (timeInMinutes === 0) return 0;
    return Math.round(wordCount / timeInMinutes);
  };

  useEffect(() => {
    if (isStarted && !isFinished) {
      if (wpmIntervalRef.current) {
        clearInterval(wpmIntervalRef.current);
      }

      wpmIntervalRef.current = setInterval(() => {
        setLiveWpm(calculateWPM());
      }, 1000);

      setLiveWpm(calculateWPM());
    }

    return () => {
      if (wpmIntervalRef.current) {
        clearInterval(wpmIntervalRef.current);
      }
    };
  }, [isStarted, isFinished, userInput]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (
      e.ctrlKey ||
      e.altKey ||
      e.metaKey ||
      e.key === "Shift" ||
      e.key === "Control" ||
      e.key === "Alt" ||
      e.key === "Meta" ||
      e.key === "Tab" ||
      e.key === "CapsLock" ||
      e.key === "Escape"
    ) {
      return;
    }

    if (e.key !== "Backspace") e.preventDefault();

    if (!isStarted && !startTime) {
      setStartTime(Date.now());
      setIsStarted(true);
    }

    if (e.key === "Backspace" && currentPosition > 0) {
      e.preventDefault();
      setCurrentPosition(currentPosition - 1);
      setUserInput(userInput.slice(0, -1));
      return;
    }

    if (currentPosition >= currentQuote.length) {
      return;
    }

    if (e.key.length === 1) {
      const newUserInput = userInput + e.key;
      setUserInput(newUserInput);
      setCurrentPosition(currentPosition + 1);

      let correctChars = 0;
      for (let i = 0; i < newUserInput.length; i++) {
        if (i < currentQuote.length && newUserInput[i] === currentQuote[i]) {
          correctChars++;
        }
      }
      const accuracyPercent =
        newUserInput.length > 0 ? Math.floor((correctChars / newUserInput.length) * 100) : 100;
      setAccuracy(accuracyPercent);

      if (newUserInput === currentQuote || currentPosition + 1 >= currentQuote.length) {
        setEndTime(Date.now());
        setIsFinished(true);

        setWpm(calculateWPM());

        if (wpmIntervalRef.current) {
          clearInterval(wpmIntervalRef.current);
          wpmIntervalRef.current = null;
        }
      }
    }
  };

  const resetGame = () => {
    initGame();
  };

  if (!mounted) return null;

  if (isFinished) {
    return (
      <div className="flex h-[70vh] w-full flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-0 text-left">
          <div className="text-muted-foreground text-xl">wpm</div>
          <div className="text-muted-foreground text-7xl font-normal">{wpm}</div>
          <div className="text-muted-foreground mt-6 text-xl">acc</div>
          <div className="text-muted-foreground text-7xl font-normal">{accuracy}%</div>
        </div>

        <div className="mt-16 flex gap-4">
          <Button
            onClick={resetGame}
            variant="ghost"
            className="text-muted-foreground text-sm uppercase tracking-wider"
          >
            sStart Over
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-3 px-4 py-8">
      <div
        ref={containerRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="max-h-80 w-full max-w-3xl overflow-y-auto focus:outline-none focus:ring-0"
      >
        <div ref={textContainerRef} className="relative text-lg leading-relaxed md:text-xl">
          <span
            className={cn(
              "absolute w-0.5 will-change-transform",
              "bg-blue-400",
              isStarted ? "" : "animate-cursor",
            )}
            style={{
              left: `${cursorStyle.left}px`,
              top: `${cursorStyle.top}px`,
              height: `${cursorStyle.height}px`,
              transition: "all 30ms cubic-bezier(0.25, 0.1, 0.25, 1.0)",
            }}
          />

          {currentQuote.split("").map((char, index) => {
            let style = "opacity-40";

            if (index < userInput.length) {
              style = userInput[index] === char ? "opacity-100" : "text-red-500 opacity-100";
            }

            return (
              <span key={index} data-char={char} className={style}>
                {char}
              </span>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex h-6 items-center gap-2">
        {isStarted && !isFinished ? (
          <>
            <span className="font-medium">{liveWpm}</span>
            <span className="text-xs uppercase tracking-wider">wpm</span>
          </>
        ) : (
          <span className="text-xs uppercase tracking-wider">
            {!isStarted ? "click and start typing" : ""}
          </span>
        )}
      </div>

      <Button
        onClick={resetGame}
        variant="ghost"
        size="sm"
        className="mt-2 text-xs uppercase tracking-wider"
      >
        Reset
      </Button>
    </div>
  );
}
