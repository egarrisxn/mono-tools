import { DateDisplay } from "@repo/ui/components/date-display";
import { TimeDisplay } from "@repo/ui/components/time-display";
import { ThemeToggle } from "@repo/ui/components/theme-toggle";

export default function Navbar() {
  return (
    <nav className="fixed top-0 z-10 flex w-full flex-row items-center justify-between p-4">
      <div className="flex items-center text-2xl font-black leading-none tracking-tighter">
        xTools
      </div>
      <div className="flex items-center gap-4">
        <TimeDisplay />
        <DateDisplay />
        <ThemeToggle />
      </div>
    </nav>
  );
}
