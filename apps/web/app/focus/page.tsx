import PomodoroTimer from "@/components/focus/pomodoro-timer";
import TaskList from "@/components/focus/task-list";
import MusicPlayer from "@/components/focus/music-player";

export default function FocusPage() {
  return (
    <div className="grid min-h-screen w-full place-items-center px-4 py-24 md:px-8 lg:px-24">
      <div className="mx-auto flex w-full max-w-6xl justify-center">
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="space-y-6">
            <PomodoroTimer />
            <TaskList />
          </div>
          <MusicPlayer />
        </div>
      </div>
    </div>
  );
}
