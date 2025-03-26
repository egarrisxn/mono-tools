"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@repo/ui/src/components/button";
import { Input } from "@repo/ui/src/components/input";
import { Checkbox } from "@repo/ui/src/components/checkbox";

import type React from "react";

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState("");

  useEffect(() => {
    const savedTasks = localStorage.getItem("focusTasks");
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("focusTasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!newTaskText.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      text: newTaskText,
      completed: false,
    };

    setTasks([...tasks, newTask]);
    setNewTaskText("");
  };

  const toggleTask = (id: string) => {
    setTasks(
      tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)),
    );
  };

  const removeTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addTask();
    }
  };

  return (
    <div className="shadow-xs mx-auto flex w-full max-w-md flex-col space-y-4 rounded-lg border p-6">
      <h2 className="text-primary/80 text-center text-lg font-medium">(tasks)</h2>

      <div className="flex space-x-2">
        <Input
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          onKeyUp={handleKeyUp} // Changed from onKeyPress to onKeyUp
          placeholder="Add task..."
          className="bg-background/50 text-primary placeholder:text-primary/50 h-9 grow border"
        />
        <Button
          onClick={addTask}
          className="bg-primary/10 text-primary hover:bg-primary/30 size-9 border-none p-0"
        >
          <Plus className="size-4" />
        </Button>
      </div>

      <div className="max-h-60 space-y-1 overflow-y-auto">
        {tasks.length === 0 ? (
          <p className="text-primary/50 text-center text-sm italic">No tasks</p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`group flex items-center rounded p-1.5 ${task.completed ? "bg-primary/5" : ""}`}
            >
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => toggleTask(task.id)}
                className="data-[state=checked]:bg-primary/70 data-[state=checked]:text-primary-foreground mr-2 border"
              />
              <span
                className={`text-primary flex-1 text-sm ${task.completed ? "text-primary/40 line-through" : ""}`}
              >
                {task.text}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeTask(task.id)}
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
