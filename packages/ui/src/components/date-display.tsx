"use client";

import { useEffect, useState } from "react";

const CurrentDate = () => {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div suppressHydrationWarning>
      {date.toLocaleDateString("en-US", {
        // weekday: "long",
        month: "numeric",
        day: "numeric",
        year: "numeric",
        timeZone: "America/New_York",
      })}
    </div>
  );
};

export function DateDisplay() {
  return (
    <div aria-label="Current date">
      <CurrentDate />
    </div>
  );
}
