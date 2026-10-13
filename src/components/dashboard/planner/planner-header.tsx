"use client";

import { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import { usePlannerStore } from "@/stores/planner-store";
import { getMonthDropdownOptions, formatDateKey } from "@/lib/planner-utils";
import EventModal from "./event-modal";

export default function PlannerHeader() {
  const monthTitle = usePlannerStore((state) => state.monthTitle);
  const selectedDate = usePlannerStore((state) => state.selectedDate);
  const viewMode = usePlannerStore((state) => state.viewMode);
  const setViewMode = usePlannerStore((state) => state.setViewMode);
  const goToToday = usePlannerStore((state) => state.goToToday);
  const goToPrevious = usePlannerStore((state) => state.goToPrevious);
  const goToNext = usePlannerStore((state) => state.goToNext);
  const goToMonth = usePlannerStore((state) => state.goToMonth);

  const [viewDropdownOpen, setViewDropdownOpen] = useState(false);
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const monthDropdownRef = useRef<HTMLDivElement>(null);
  const viewDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        monthDropdownRef.current &&
        !monthDropdownRef.current.contains(e.target as Node)
      ) {
        setMonthDropdownOpen(false);
      }
      if (
        viewDropdownRef.current &&
        !viewDropdownRef.current.contains(e.target as Node)
      ) {
        setViewDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const monthOptions = getMonthDropdownOptions(new Date());

  // Check if viewing current real date
  const todayKey = formatDateKey(new Date());
  const isViewingToday = selectedDate === todayKey;

  const pastMonths = monthOptions.filter((m) => m.category === "past");
  const currentMonthOpt = monthOptions.find((m) => m.category === "current");
  const upcomingMonths = monthOptions.filter((m) => m.category === "upcoming");

  return (
    <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 select-none">
      {/* Left: Month/Year selector & Week Navigation Arrows */}
      <div className="flex items-center gap-3">
        {/* Month Dropdown */}
        <div className="relative" ref={monthDropdownRef}>
          <button
            type="button"
            onClick={() => setMonthDropdownOpen(!monthDropdownOpen)}
            className="group flex items-center gap-1.5 rounded-lg px-2 py-1 text-base font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
          >
            <span>{monthTitle}</span>
            <ChevronDown
              className={`size-4 text-slate-400 group-hover:text-slate-600 transition-transform duration-150 ${
                monthDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {monthDropdownOpen && (
            <div className="absolute top-10 left-0 z-40 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in zoom-in-95 duration-100 max-h-[380px] overflow-y-auto">
              {/* Group 1: Last 3 Months from Now */}
              <div className="px-2 pt-1 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Last 3 Months from Now
              </div>
              {pastMonths.map((m) => {
                const isSelected = monthTitle === m.label;
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => {
                      goToMonth(m.year, m.monthIndex);
                      setMonthDropdownOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition-colors ${
                      isSelected
                        ? "bg-blue-50 text-blue-700 font-semibold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>{m.label}</span>
                    <span className="text-[10px] text-slate-400">
                      {Math.abs(m.offset)}m ago
                    </span>
                  </button>
                );
              })}

              {/* Group 2: Current Month */}
              <div className="border-t border-slate-100 my-1.5" />
              <div className="px-2 pt-0.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-blue-600">
                Current Month
              </div>
              {currentMonthOpt && (
                <button
                  type="button"
                  onClick={() => {
                    goToMonth(currentMonthOpt.year, currentMonthOpt.monthIndex);
                    setMonthDropdownOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition-colors ${
                    monthTitle === currentMonthOpt.label
                      ? "bg-blue-600 text-white font-semibold"
                      : "bg-blue-50/60 text-blue-700 hover:bg-blue-100/60"
                  }`}
                >
                  <span>{currentMonthOpt.label}</span>
                  <span
                    className={`text-[10px] rounded px-1.5 py-0.5 font-semibold ${
                      monthTitle === currentMonthOpt.label
                        ? "bg-blue-700 text-blue-100"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    Now
                  </span>
                </button>
              )}

              {/* Group 3: Upcoming Months */}
              <div className="border-t border-slate-100 my-1.5" />
              <div className="px-2 pt-0.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Upcoming
              </div>
              {upcomingMonths.map((m) => {
                const isSelected = monthTitle === m.label;
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => {
                      goToMonth(m.year, m.monthIndex);
                      setMonthDropdownOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition-colors ${
                      isSelected
                        ? "bg-blue-50 text-blue-700 font-semibold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>{m.label}</span>
                    <span className="text-[10px] text-slate-400">+{m.offset}m</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Previous / Next Arrow Controls */}
        <div className="flex items-center gap-0.5 border border-slate-200 rounded-lg p-0.5 bg-slate-50/60">
          <button
            type="button"
            onClick={goToPrevious}
            title={`Previous ${viewMode}`}
            className="rounded p-1 text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-2xs transition-all"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={goToNext}
            title={`Next ${viewMode}`}
            className="rounded p-1 text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-2xs transition-all"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {/* Right: Today button, View Mode dropdown, + Event button */}
      <div className="flex items-center gap-2.5">
        {/* Today button */}
        <button
          type="button"
          onClick={goToToday}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all shadow-2xs ${
            isViewingToday
              ? "border-blue-200 bg-blue-50/70 text-blue-700 font-semibold"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          Today
        </button>

        {/* View mode dropdown */}
        <div className="relative" ref={viewDropdownRef}>
          <button
            type="button"
            onClick={() => setViewDropdownOpen(!viewDropdownOpen)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <span className="capitalize">{viewMode}</span>
            <ChevronDown className="size-3.5 text-slate-400" />
          </button>

          {viewDropdownOpen && (
            <div className="absolute right-0 top-9 z-40 w-32 rounded-xl border border-slate-200 bg-white p-1 shadow-lg animate-in fade-in zoom-in-95 duration-100">
              {(["week", "day", "month"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    setViewMode(mode);
                    setViewDropdownOpen(false);
                  }}
                  className={`w-full rounded-lg px-2.5 py-1.5 text-left text-xs font-medium capitalize transition-colors ${
                    viewMode === mode
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Add Event button */}
        <button
          type="button"
          onClick={() => setAddModalOpen(true)}
          className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-2xs hover:bg-blue-700 transition-colors active:scale-95"
        >
          <Plus className="size-3.5" />
          <span>Event</span>
        </button>
      </div>

      <EventModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        defaultDateKey={selectedDate}
        defaultStartHour={10}
      />
    </div>
  );
}
