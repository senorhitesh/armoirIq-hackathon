"use client";

import { CheckSquare, Link2, Calendar } from "lucide-react";
import { usePlannerStore } from "@/stores/planner-store";

export default function LeftRail() {
  const railActive = usePlannerStore((state) => state.railActive);
  const setRailActive = usePlannerStore((state) => state.setRailActive);

  return (
    <div className="w-12 shrink-0 border-r border-slate-200 bg-white py-5 flex flex-col items-center gap-4 select-none">
      {/* 1. Tasks / Check icon (Active by default matching the screenshot) */}
      <button
        type="button"
        onClick={() => setRailActive("tasks")}
        title="Tasks & Schedule"
        className={`size-8 rounded-lg flex items-center justify-center transition-all ${
          railActive === "tasks"
            ? "border border-slate-800 text-slate-900 bg-white shadow-2xs"
            : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
        }`}
      >
        <CheckSquare className="size-4 stroke-[2.2]" />
      </button>

      {/* 2. Links / Integrations icon */}
      <button
        type="button"
        onClick={() => setRailActive("links")}
        title="Linked Sources & Docs"
        className={`size-8 rounded-lg flex items-center justify-center transition-all ${
          railActive === "links"
            ? "border border-slate-800 text-slate-900 bg-white shadow-2xs"
            : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
        }`}
      >
        <Link2 className="size-4.5" />
      </button>

      {/* 3. Calendar icon */}
      <button
        type="button"
        onClick={() => setRailActive("calendar")}
        title="Full Calendar"
        className={`size-8 rounded-lg flex items-center justify-center transition-all ${
          railActive === "calendar"
            ? "border border-slate-800 text-slate-900 bg-white shadow-2xs"
            : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
        }`}
      >
        <Calendar className="size-4" />
      </button>
    </div>
  );
}
