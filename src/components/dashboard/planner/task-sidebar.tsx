"use client";

import { useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { usePlannerStore } from "@/stores/planner-store";

export default function TaskSidebar() {
  const tasks = usePlannerStore((state) => state.tasks);
  const toggleTask = usePlannerStore((state) => state.toggleTask);
  const addTask = usePlannerStore((state) => state.addTask);
  const deleteTask = usePlannerStore((state) => state.deleteTask);

  const [addingSection, setAddingSection] = useState<"today" | "upcoming" | null>(
    null
  );
  const [newTitle, setNewTitle] = useState("");

  const todayTasks = tasks.filter((t) => t.section === "today");
  const upcomingTasks = tasks.filter((t) => t.section === "upcoming");

  const todayFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const handleCreateTask = (section: "today" | "upcoming") => {
    if (newTitle.trim()) {
      addTask(section, newTitle.trim());
      setNewTitle("");
    }
    setAddingSection(null);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    section: "today" | "upcoming"
  ) => {
    if (e.key === "Enter") {
      handleCreateTask(section);
    } else if (e.key === "Escape") {
      setAddingSection(null);
      setNewTitle("");
    }
  };

  return (
    <aside className="w-60 shrink-0 border-r border-slate-200 bg-white px-5 py-5 flex flex-col justify-between overflow-y-auto select-none">
      <div>
        {/* Today Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-semibold text-slate-900 tracking-tight">
              Today
            </h3>
            <span className="text-[11px] font-medium text-slate-400">
              {todayFormatted}
            </span>
          </div>

          <div className="space-y-2.5">
            {todayTasks.map((task) => (
              <div
                key={task.id}
                draggable={true}
                onDragStart={(e) => {
                  e.dataTransfer.setData(
                    "application/json",
                    JSON.stringify({
                      type: "task-item",
                      taskId: task.id,
                      title: task.title,
                    })
                  );
                  e.dataTransfer.effectAllowed = "copy";
                }}
                className="group flex items-center justify-between gap-2 text-[13px] rounded-lg p-1 hover:bg-slate-50 cursor-grab active:cursor-grabbing transition-colors"
              >
                <div
                  onClick={() => toggleTask(task.id)}
                  className="flex flex-1 items-center gap-2 cursor-pointer min-w-0"
                >
                  <button
                    type="button"
                    className={`size-4 shrink-0 rounded-full border transition-all flex items-center justify-center ${
                      task.completed
                        ? "border-[#e05638] bg-[#e05638] text-white"
                        : "border-slate-300 hover:border-slate-400 bg-white"
                    }`}
                  >
                    {task.completed && (
                      <Check className="size-2.5 stroke-[3]" />
                    )}
                  </button>
                  <span
                    className={`truncate transition-colors ${
                      task.completed
                        ? "line-through text-slate-400"
                        : "text-slate-700 hover:text-slate-900"
                    }`}
                  >
                    {task.title}
                  </span>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => deleteTask(task.id)}
                    title="Delete task"
                    className="text-slate-300 hover:text-rose-500 p-0.5 transition-colors"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              </div>
            ))}

            {/* Add Task for Today */}
            {addingSection === "today" ? (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  autoFocus
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, "today")}
                  onBlur={() => handleCreateTask("today")}
                  placeholder="Task title..."
                  className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAddingSection("today");
                  setNewTitle("");
                }}
                className="flex items-center gap-2 text-[12px] text-slate-400 hover:text-slate-600 transition-colors pt-1"
              >
                <Plus className="size-3.5" />
                <span>Add a task</span>
              </button>
            )}
          </div>
        </div>

        {/* Upcoming Section */}
        <div className="mt-8">
          <h3 className="text-[13px] font-semibold text-slate-900 mb-3 tracking-tight">
            Upcoming
          </h3>

          <div className="space-y-2.5">
            {upcomingTasks.map((task) => (
              <div
                key={task.id}
                draggable={true}
                onDragStart={(e) => {
                  e.dataTransfer.setData(
                    "application/json",
                    JSON.stringify({
                      type: "task-item",
                      taskId: task.id,
                      title: task.title,
                    })
                  );
                  e.dataTransfer.effectAllowed = "copy";
                }}
                className="group flex items-center justify-between gap-2 text-[13px] rounded-lg p-1 hover:bg-slate-50 cursor-grab active:cursor-grabbing transition-colors"
              >
                <div
                  onClick={() => toggleTask(task.id)}
                  className="flex flex-1 items-center gap-2 cursor-pointer min-w-0"
                >
                  <button
                    type="button"
                    className={`size-4 shrink-0 rounded-full border transition-all flex items-center justify-center ${
                      task.completed
                        ? "border-[#e05638] bg-[#e05638] text-white"
                        : "border-slate-300 hover:border-slate-400 bg-white"
                    }`}
                  >
                    {task.completed && (
                      <Check className="size-2.5 stroke-[3]" />
                    )}
                  </button>
                  <span
                    className={`truncate transition-colors ${
                      task.completed
                        ? "line-through text-slate-400"
                        : "text-slate-700 hover:text-slate-900"
                    }`}
                  >
                    {task.title}
                  </span>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => deleteTask(task.id)}
                    title="Delete task"
                    className="text-slate-300 hover:text-rose-500 p-0.5 transition-colors"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              </div>
            ))}

            {/* Add Task for Upcoming */}
            {addingSection === "upcoming" ? (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  autoFocus
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, "upcoming")}
                  onBlur={() => handleCreateTask("upcoming")}
                  placeholder="Task title..."
                  className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAddingSection("upcoming");
                  setNewTitle("");
                }}
                className="flex items-center gap-2 text-[12px] text-slate-400 hover:text-slate-600 transition-colors pt-1"
              >
                <Plus className="size-3.5" />
                <span>Add a task</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
