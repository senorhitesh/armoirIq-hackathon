"use client";



import TaskSidebar from "./task-sidebar";
import PlannerHeader from "./planner-header";
import CalendarGrid from "./calendar-grid";

export default function PlannerView() {
  return (
    <div className="flex flex-1 overflow-hidden min-h-0 bg-white">
      {/* 1. Today & Upcoming Task Sidebar */}
      <TaskSidebar />

      {/* 2. Main Calendar Planner Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0 bg-white">
        <PlannerHeader />
        <CalendarGrid />
      </div>
    </div>
  );
}
