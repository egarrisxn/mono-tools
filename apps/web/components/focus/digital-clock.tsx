"use client";

import { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import { Button } from "@repo/ui/src/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/src/components/dropdown-menu";

type DatePosition = "above" | "below" | "hidden";

export default function DigitalClock() {
  const [time, setTime] = useState(new Date());
  const [datePosition, setDatePosition] = useState<DatePosition>("below");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    const savedPosition = localStorage.getItem("datePosition") as DatePosition;
    if (savedPosition) {
      setDatePosition(savedPosition);
    }

    return () => clearInterval(timer);
  }, []);

  const updateDatePosition = (position: DatePosition) => {
    setDatePosition(position);
    localStorage.setItem("datePosition", position);
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  const formatAmericanDate = (date: Date) => {
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  return (
    <div className="flex flex-col items-center justify-center gap-1 px-8 py-2 text-6xl font-bold">
      {datePosition === "above" && (
        <div className="text-primary/60 mb-2 text-lg">
          <span suppressHydrationWarning>{formatAmericanDate(time)}</span>
        </div>
      )}
      <div>
        <span suppressHydrationWarning>{formatTime(time)}</span>
      </div>
      {datePosition === "below" && (
        <div className="text-primary/60 mt-2 text-lg">
          <span suppressHydrationWarning>{formatAmericanDate(time)}</span>
        </div>
      )}
      {isClient && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="mt-1 size-8">
              <Settings className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="center"
            className="bg-background text-primary/70 flex flex-col items-center justify-center border"
          >
            <DropdownMenuLabel className="text-primary bg-foreground/20">
              Date Display
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="hover:text-primary cursor-pointer"
              onClick={() => updateDatePosition("above")}
            >
              Above Time
            </DropdownMenuItem>
            <DropdownMenuItem
              className="hover:text-primary cursor-pointer"
              onClick={() => updateDatePosition("below")}
            >
              Below Time
            </DropdownMenuItem>
            <DropdownMenuItem
              className="hover:text-primary cursor-pointer"
              onClick={() => updateDatePosition("hidden")}
            >
              Hidden
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
