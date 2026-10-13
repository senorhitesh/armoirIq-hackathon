"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  TIME_SLOTS,
  PlannerEvent,
  usePlannerStore,
} from "@/stores/planner-store";
import {
  formatDateKey,
  formatEventDisplayTime,
  getCurrentHourFloat,
  getMonthGrid,
  getWeekDates,
  parseDateKey,
} from "@/lib/planner-utils";
import EventModal from "./event-modal";
import ArmorIQActionModal from "./armoriq-action-modal";
import { GripVertical, Shield, Zap } from "lucide-react";

const HOUR_HEIGHT = 72; // px per hour row
const START_HOUR = 8; // 8 AM start

export default function CalendarGrid() {
  const events = usePlannerStore((state) => state.events);
  const selectedDate = usePlannerStore((state) => state.selectedDate);
  const viewMode = usePlannerStore((state) => state.viewMode);
  const setSelectedDate = usePlannerStore((state) => state.setSelectedDate);
  const setViewMode = usePlannerStore((state) => state.setViewMode);
  const updateEvent = usePlannerStore((state) => state.updateEvent);
  const addEvent = usePlannerStore((state) => state.addEvent);

  // ArmorIQ Guardrail State
  const armoriqModalOpen = usePlannerStore((state) => state.armoriqModalOpen);
  const setArmoriqModalOpen = usePlannerStore((state) => state.setArmoriqModalOpen);
  const armoriqActiveEvent = usePlannerStore((state) => state.armoriqActiveEvent);
  const openArmoriqForEvent = usePlannerStore((state) => state.openArmoriqForEvent);

  const [currentTimeHour, setCurrentTimeHour] = useState(getCurrentHourFloat());
  const [selectedEvent, setSelectedEvent] = useState<PlannerEvent | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSlot, setModalSlot] = useState<{
    dateKey: string;
    startHour: number;
  }>({
    dateKey: selectedDate,
    startHour: 10,
  });

  // Drag-and-drop state
  const [draggingEventId, setDraggingEventId] = useState<string | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<{
    dateKey: string;
    hour?: number;
  } | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep clock running every 60 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimeHour(getCurrentHourFloat());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Auto-scroll to near current time or 9 AM on initial mount
  useEffect(() => {
    if (scrollRef.current) {
      const targetHour = Math.max(8.5, Math.min(currentTimeHour - 1, 16));
      const targetTop = (targetHour - START_HOUR) * HOUR_HEIGHT;
      scrollRef.current.scrollTo({ top: targetTop, behavior: "smooth" });
    }
  }, []);

  const parsedCurrentDate = parseDateKey(selectedDate);
  const today = new Date();
  const todayKey = formatDateKey(today);

  const weekDays = getWeekDates(parsedCurrentDate, today);

  const oct15Event = events.find(
    (e) =>
      e.armoriqEnabled ||
      ((e.date.endsWith("-10-15") || e.date === "2026-10-15") && e.startHour === 20)
  ) || {
    id: "evt-armoriq-15oct-8pm",
    title: "🚀 Scheduled Post: Q4 Viral Launch",
    date: "2026-10-15",
    startHour: 20,
    durationHours: 1,
    displayTime: "8 PM – 9 PM",
    color: "purple" as const,
    description: "Stop building products nobody asked for. Here is the 3-step validation framework that saved our company $240,000 in wasted ad spend.",
    isScheduledPost: true,
    armoriqEnabled: true,
    armoriqStatus: "action-ready" as const,
  };

  const handleSlotClick = (dateKey: string, hour: number) => {
    setSelectedEvent(null);
    setModalSlot({ dateKey, startHour: hour });
    setModalOpen(true);
  };

  const handleEventClick = (e: React.MouseEvent, evt: PlannerEvent) => {
    e.stopPropagation();
    setSelectedEvent(evt);
    setModalOpen(true);
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, evt: PlannerEvent) => {
    e.stopPropagation();
    setDraggingEventId(evt.id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        type: "calendar-event",
        eventId: evt.id,
        durationHours: evt.durationHours,
      })
    );
  };

  const handleDragEnd = () => {
    setDraggingEventId(null);
    setDragOverTarget(null);
  };

  const handleSlotDragOver = (
    e: React.DragEvent,
    dateKey: string,
    hour: number
  ) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (
      !dragOverTarget ||
      dragOverTarget.dateKey !== dateKey ||
      dragOverTarget.hour !== hour
    ) {
      setDragOverTarget({ dateKey, hour });
    }
  };

  const handleSlotDrop = (
    e: React.DragEvent,
    dateKey: string,
    dayIndex: number,
    hour: number
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingEventId(null);
    setDragOverTarget(null);

    try {
      const raw = e.dataTransfer.getData("application/json");
      if (!raw) return;
      const data = JSON.parse(raw);

      if (data.type === "calendar-event") {
        const evt = events.find((item) => item.id === data.eventId);
        const duration = evt?.durationHours || data.durationHours || 1;
        const displayTime = formatEventDisplayTime(hour, duration);

        updateEvent(data.eventId, {
          date: dateKey,
          dayIndex,
          startHour: hour,
          displayTime,
        });
      } else if (data.type === "task-item") {
        // Dragged from TaskSidebar onto Calendar
        const displayTime = formatEventDisplayTime(hour, 1);
        addEvent({
          title: data.title,
          date: dateKey,
          dayIndex,
          startHour: hour,
          durationHours: 1,
          displayTime,
          color: "blue",
        });
      }
    } catch (err) {
      console.error("Drop parsing failed:", err);
    }
  };

  const handleMonthCellDrop = (
    e: React.DragEvent,
    dateKey: string,
    dayIndex: number
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingEventId(null);
    setDragOverTarget(null);

    try {
      const raw = e.dataTransfer.getData("application/json");
      if (!raw) return;
      const data = JSON.parse(raw);

      if (data.type === "calendar-event") {
        updateEvent(data.eventId, {
          date: dateKey,
          dayIndex,
        });
      } else if (data.type === "task-item") {
        addEvent({
          title: data.title,
          date: dateKey,
          dayIndex,
          startHour: 10,
          durationHours: 1,
          displayTime: "10 AM",
          color: "blue",
        });
      }
    } catch (err) {
      console.error("Drop parsing failed:", err);
    }
  };

  const getEventStyles = (color: PlannerEvent["color"]) => {
    switch (color) {
      case "blue":
        return {
          container: "bg-[#eaf2fe] border-l-[#2563eb] hover:bg-[#e2edfe]",
          title: "text-[#1e3a8a]",
          time: "text-[#2563eb]",
          pill: "bg-blue-100 text-blue-800 border-l-blue-500",
        };
      case "purple":
        return {
          container: "bg-[#f5eeff] border-l-[#9333ea] hover:bg-[#efe5ff]",
          title: "text-[#581c87]",
          time: "text-[#7e22ce]",
          pill: "bg-purple-100 text-purple-800 border-l-purple-500",
        };
      case "green":
        return {
          container: "bg-[#ecfdf5] border-l-[#10b981] hover:bg-[#e2fbe9]",
          title: "text-[#065f46]",
          time: "text-[#059669]",
          pill: "bg-emerald-100 text-emerald-800 border-l-emerald-500",
        };
      case "amber":
        return {
          container: "bg-[#fff8e7] border-l-[#d97706] hover:bg-[#ffefce]",
          title: "text-[#78350f]",
          time: "text-[#b45309]",
          pill: "bg-amber-100 text-amber-800 border-l-amber-500",
        };
      case "rose":
        return {
          container: "bg-[#fff0f2] border-l-[#e11d48] hover:bg-[#ffe2e6]",
          title: "text-[#881337]",
          time: "text-[#be123c]",
          pill: "bg-rose-100 text-rose-800 border-l-rose-500",
        };
      default:
        return {
          container: "bg-slate-50 border-l-slate-400 hover:bg-slate-100",
          title: "text-slate-800",
          time: "text-slate-500",
          pill: "bg-slate-100 text-slate-800 border-l-slate-400",
        };
    }
  };

  // Red line offset from top of grid
  const redLineTop = (currentTimeHour - START_HOUR) * HOUR_HEIGHT;
  const isCurrentTimeInRange = currentTimeHour >= START_HOUR && currentTimeHour <= 21;

  // Filter events helper
  const getDayEvents = (dateKey: string, dayIndex?: number) => {
    return events.filter(
      (e) =>
        e.date === dateKey ||
        (!e.date && e.dayIndex !== undefined && e.dayIndex === dayIndex)
    );
  };

  // -------------------------------------------------------------
  // RENDER: Month View
  // -------------------------------------------------------------
  if (viewMode === "month") {
    const monthGrid = getMonthGrid(parsedCurrentDate, today);
    const weekdaysShort = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    return (
      <div className="flex flex-1 flex-col overflow-hidden bg-white select-none">
        {/* Weekday labels */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/70">
          {weekdaysShort.map((w) => (
            <div
              key={w}
              className="py-2.5 text-center text-xs font-semibold text-slate-600 border-r border-slate-200 last:border-r-0"
            >
              {w}
            </div>
          ))}
        </div>

        {/* Month 7x6 Matrix */}
        <div className="grid flex-1 grid-cols-7 grid-rows-6 divide-x divide-y divide-slate-100 overflow-y-auto">
          {monthGrid.map((day) => {
            const dayEvents = getDayEvents(day.dateKey, day.index);
            const isOver = dragOverTarget?.dateKey === day.dateKey;

            return (
              <div
                key={day.dateKey}
                onClick={() => {
                  setSelectedDate(day.dateKey);
                  setViewMode("day");
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  if (dragOverTarget?.dateKey !== day.dateKey) {
                    setDragOverTarget({ dateKey: day.dateKey });
                  }
                }}
                onDragLeave={() => {
                  if (dragOverTarget?.dateKey === day.dateKey) {
                    setDragOverTarget(null);
                  }
                }}
                onDrop={(e) => handleMonthCellDrop(e, day.dateKey, day.index)}
                className={`group min-h-[90px] p-1.5 transition-colors cursor-pointer flex flex-col justify-between ${
                  isOver
                    ? "bg-blue-50 ring-2 ring-blue-500 ring-inset"
                    : !day.isCurrentMonth
                    ? "bg-slate-50/40 opacity-50 hover:bg-slate-50/80"
                    : "bg-white hover:bg-slate-50/80"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex size-6 items-center justify-center rounded-full text-xs font-medium transition-all ${
                      day.isToday
                        ? "bg-[#e05638] text-white font-bold shadow-xs"
                        : "text-slate-700 group-hover:text-slate-900"
                    }`}
                  >
                    {day.dayNumber}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSlotClick(day.dateKey, 10);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-[10px] text-blue-600 hover:text-blue-800 font-semibold px-1 rounded transition-opacity"
                  >
                    + Add
                  </button>
                </div>

                {/* Event pills preview */}
                <div className="mt-1 space-y-1 overflow-hidden flex-1">
                  {dayEvents.slice(0, 3).map((evt) => {
                    const styles = getEventStyles(evt.color);
                    const isDragging = draggingEventId === evt.id;

                    return (
                      <div
                        key={evt.id}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, evt)}
                        onDragEnd={handleDragEnd}
                        onClick={(e) => handleEventClick(e, evt)}
                        className={`truncate rounded px-1.5 py-0.5 text-[10px] font-medium border-l-2 cursor-grab active:cursor-grabbing transition-all hover:scale-[1.02] ${
                          styles.pill
                        } ${isDragging ? "opacity-30 scale-95" : ""}`}
                      >
                        {evt.title}
                      </div>
                    );
                  })}
                  {dayEvents.length > 3 && (
                    <div className="text-[10px] text-slate-400 font-medium pl-1">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <EventModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          event={selectedEvent}
          defaultDateKey={modalSlot.dateKey}
          defaultStartHour={modalSlot.startHour}
        />
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: Day View
  // -------------------------------------------------------------
  if (viewMode === "day") {
    const isToday = selectedDate === todayKey;
    const dayEvents = getDayEvents(selectedDate);
    const dayDate = parseDateKey(selectedDate);
    const fullDayLabel = dayDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    return (
      <div
        ref={scrollRef}
        className="flex flex-1 flex-col overflow-y-auto select-none bg-white"
      >
        {/* Day Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-8 py-3.5 shadow-2xs">
          <div className="flex items-center gap-3">
            <h3
              className={`text-sm ${
                isToday ? "font-bold text-[#e05638]" : "font-semibold text-slate-800"
              }`}
            >
              {fullDayLabel}
            </h3>
            {isToday && (
              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-semibold text-[#e05638]">
                Today
              </span>
            )}
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {dayEvents.length} scheduled event{dayEvents.length === 1 ? "" : "s"}
          </span>
        </div>

        {/* Day Grid with single column */}
        <div className="relative flex flex-1">
          {/* Time Labels */}
          <div className="w-20 shrink-0 py-2">
            {TIME_SLOTS.map((slot) => (
              <div
                key={slot.hour}
                style={{ height: `${HOUR_HEIGHT}px` }}
                className="relative pr-4 text-right"
              >
                <span className="text-[11px] font-medium text-slate-400">
                  {slot.label}
                </span>
              </div>
            ))}
          </div>

          {/* Single Day Column */}
          <div className="relative flex-1 border-l border-slate-100 mr-8">
            {/* Hour slot rows */}
            {TIME_SLOTS.map((slot) => {
              const isOver =
                dragOverTarget?.dateKey === selectedDate &&
                dragOverTarget?.hour === slot.hour;

              return (
                <div
                  key={slot.hour}
                  onClick={() => handleSlotClick(selectedDate, slot.hour)}
                  onDragOver={(e) =>
                    handleSlotDragOver(e, selectedDate, slot.hour)
                  }
                  onDragLeave={() => {
                    if (
                      dragOverTarget?.dateKey === selectedDate &&
                      dragOverTarget?.hour === slot.hour
                    ) {
                      setDragOverTarget(null);
                    }
                  }}
                  onDrop={(e) =>
                    handleSlotDrop(
                      e,
                      selectedDate,
                      (dayDate.getDay() + 6) % 7,
                      slot.hour
                    )
                  }
                  style={{ height: `${HOUR_HEIGHT}px` }}
                  className={`group border-b border-slate-100 transition-all cursor-pointer ${
                    isOver
                      ? "bg-blue-50/90 border-dashed border-blue-400 ring-2 ring-blue-400 ring-inset"
                      : "hover:bg-slate-50/50"
                  }`}
                >
                  <div className="h-full w-full opacity-0 group-hover:opacity-100 flex items-center pl-6">
                    <span
                      className={`text-xs font-medium ${
                        isOver ? "text-blue-600 font-semibold" : "text-slate-400"
                      }`}
                    >
                      {isOver ? "Drop to reschedule here" : `+ Schedule at ${slot.label}`}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Red Current Time Line */}
            {isToday && isCurrentTimeInRange && (
              <div
                style={{ top: `${redLineTop}px` }}
                className="pointer-events-none absolute left-0 right-0 z-20 flex items-center"
              >
                <div className="size-2.5 rounded-full bg-[#e05638] -ml-1.5 shadow-xs" />
                <div className="h-[2px] flex-1 bg-[#e05638]" />
              </div>
            )}

            {/* Day Events */}
            {dayEvents.map((evt) => {
              const styles = getEventStyles(evt.color);
              const top = (evt.startHour - START_HOUR) * HOUR_HEIGHT;
              const height = evt.durationHours * HOUR_HEIGHT;
              const isDragging = draggingEventId === evt.id;
              const isArmoriq =
                evt.armoriqEnabled ||
                ((evt.date.endsWith("-10-15") || evt.date === "2026-10-15") && evt.startHour === 20);

              return (
                <div
                  key={evt.id}
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, evt)}
                  onDragEnd={handleDragEnd}
                  onClick={(e) => handleEventClick(e, evt)}
                  style={{
                    top: `${top + 2}px`,
                    height: `${Math.max(height - 4, isArmoriq ? 52 : 34)}px`,
                  }}
                  className={`absolute left-3 right-6 z-10 cursor-grab active:cursor-grabbing rounded-xl border-l-[4px] p-3 transition-all duration-150 shadow-xs hover:shadow-md hover:scale-[1.005] select-none ${
                    styles.container
                  } ${isDragging ? "opacity-35 scale-[0.98] ring-2 ring-blue-400" : ""} ${
                    isArmoriq ? "ring-2 ring-emerald-500/80 shadow-md" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className={`text-sm font-semibold flex items-center gap-1.5 ${styles.title}`}>
                          <GripVertical className="size-3 text-slate-400 opacity-60 inline" />
                          {evt.title}
                        </h4>
                        {isArmoriq && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                            <Shield className="size-3 text-emerald-700" />
                            ArmorIQ Gate Active
                          </span>
                        )}
                      </div>
                      {evt.displayTime && (
                        <p className={`text-xs mt-0.5 pl-4.5 ${styles.time}`}>
                          {evt.displayTime}
                        </p>
                      )}
                    </div>

                    {isArmoriq && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openArmoriqForEvent(evt);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                      >
                        <Zap className="size-3 text-emerald-400" />
                        <span>ArmorIQ Action</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <EventModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          event={selectedEvent}
          defaultDateKey={modalSlot.dateKey}
          defaultStartHour={modalSlot.startHour}
        />
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: Week View (Default)
  // -------------------------------------------------------------
  return (
    <div
      ref={scrollRef}
      className="flex flex-1 flex-col overflow-y-auto select-none bg-white"
    >
      {/* ArmorIQ Zero-Trust Scheduled Gate Notice Banner */}
      <div className="mx-6 my-2.5 rounded-xl border border-slate-800 bg-slate-900 text-white p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
            <Shield className="size-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">ArmorIQ Zero-Trust Gatekeeper:</span>
              <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-mono font-semibold border border-emerald-500/30">
                ARMED FOR 8:00 PM (15 OCT)
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Scheduled viral launch post on 15 Oct at 8:00 PM will trigger automated pre-publish prompt injection scans and budget verification.
            </p>
          </div>
        </div>

        <button
          onClick={() => openArmoriqForEvent(oct15Event)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Zap className="size-3.5" />
          <span>Simulate 8 PM ArmorIQ Action</span>
        </button>
      </div>

      {/* 7-Day Headers Row */}
      <div className="sticky top-0 z-20 flex border-b border-slate-200 bg-white">
        {/* Left gutter aligned with time column */}
        <div className="w-16 shrink-0 border-r border-transparent" />

        {/* 7 Day Columns Header */}
        <div className="grid flex-1 grid-cols-7">
          {weekDays.map((day) => (
            <div
              key={day.dateKey}
              onClick={() => {
                setSelectedDate(day.dateKey);
              }}
              className="py-3 text-center border-r border-slate-100 last:border-r-0 cursor-pointer hover:bg-slate-50/60 transition-colors"
            >
              <span
                className={`text-[13px] ${
                  day.isToday
                    ? "font-bold text-[#e05638]"
                    : "font-medium text-slate-700"
                }`}
              >
                {day.weekday} {day.dayNumber}
              </span>
              {day.isToday && (
                <div className="mx-auto mt-0.5 size-1.5 rounded-full bg-[#e05638]" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Grid Content with Time Column & 7 Day Columns */}
      <div className="relative flex flex-1">
        {/* Time Labels Column */}
        <div className="w-16 shrink-0 py-2">
          {TIME_SLOTS.map((slot) => (
            <div
              key={slot.hour}
              style={{ height: `${HOUR_HEIGHT}px` }}
              className="relative pr-3 text-right"
            >
              <span className="text-[11px] font-medium text-slate-400">
                {slot.label}
              </span>
            </div>
          ))}
        </div>

        {/* 7 Day Columns with Grid lines & Events */}
        <div className="relative grid flex-1 grid-cols-7 border-l border-slate-100">
          {weekDays.map((day) => {
            const dayEvents = getDayEvents(day.dateKey, day.index);

            return (
              <div
                key={day.dateKey}
                className="relative border-r border-slate-100 last:border-r-0"
              >
                {/* Horizontal hour lines */}
                {TIME_SLOTS.map((slot) => {
                  const isOver =
                    dragOverTarget?.dateKey === day.dateKey &&
                    dragOverTarget?.hour === slot.hour;

                  return (
                    <div
                      key={slot.hour}
                      onClick={() => handleSlotClick(day.dateKey, slot.hour)}
                      onDragOver={(e) =>
                        handleSlotDragOver(e, day.dateKey, slot.hour)
                      }
                      onDragLeave={() => {
                        if (
                          dragOverTarget?.dateKey === day.dateKey &&
                          dragOverTarget?.hour === slot.hour
                        ) {
                          setDragOverTarget(null);
                        }
                      }}
                      onDrop={(e) =>
                        handleSlotDrop(e, day.dateKey, day.index, slot.hour)
                      }
                      style={{ height: `${HOUR_HEIGHT}px` }}
                      className={`group border-b border-slate-100 transition-all cursor-pointer ${
                        isOver
                          ? "bg-blue-100/70 border-dashed border-blue-400 ring-2 ring-blue-400 ring-inset"
                          : "hover:bg-slate-50/50"
                      }`}
                    >
                      <div className="h-full w-full opacity-0 group-hover:opacity-100 flex items-center justify-center">
                        <span
                          className={`text-[10px] font-medium ${
                            isOver ? "text-blue-700 font-bold" : "text-slate-400"
                          }`}
                        >
                          {isOver ? "Drop" : "+ Add"}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Red Current Time Line on Today's Column */}
                {day.isToday && isCurrentTimeInRange && (
                  <div
                    style={{ top: `${redLineTop}px` }}
                    className="pointer-events-none absolute left-0 right-0 z-20 flex items-center"
                  >
                    <div className="size-2 rounded-full bg-[#e05638] -ml-1 shadow-xs" />
                    <div className="h-[2px] flex-1 bg-[#e05638]" />
                  </div>
                )}

                {/* Day Events (Draggable) */}
                {dayEvents.map((evt) => {
                  const styles = getEventStyles(evt.color);
                  const top = (evt.startHour - START_HOUR) * HOUR_HEIGHT;
                  const height = evt.durationHours * HOUR_HEIGHT;
                  const isDragging = draggingEventId === evt.id;
                  const isArmoriq =
                    evt.armoriqEnabled ||
                    ((evt.date.endsWith("-10-15") || evt.date === "2026-10-15") && evt.startHour === 20);

                  return (
                    <div
                      key={evt.id}
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, evt)}
                      onDragEnd={handleDragEnd}
                      onClick={(e) => handleEventClick(e, evt)}
                      style={{
                        top: `${top + 2}px`,
                        height: `${Math.max(height - 4, isArmoriq ? 46 : 30)}px`,
                      }}
                      title={isArmoriq ? "Protected by ArmorIQ Zero-Trust Guardrail (Click to inspect)" : "Drag to reschedule or click to edit"}
                      className={`absolute left-1 right-1 z-10 cursor-grab active:cursor-grabbing rounded-lg border-l-[3.5px] p-1.5 transition-all duration-150 shadow-2xs hover:shadow-xs hover:scale-[1.01] select-none ${
                        styles.container
                      } ${isDragging ? "opacity-30 scale-95 ring-2 ring-blue-500" : ""} ${
                        isArmoriq ? "ring-1 ring-emerald-500/80 shadow-xs" : ""
                      }`}
                    >
                      <div className="flex flex-col h-full justify-between overflow-hidden">
                        <div>
                          <div className="flex items-center justify-between">
                            <h4
                              className={`truncate text-[11px] font-semibold leading-snug flex-1 ${styles.title}`}
                            >
                              {evt.title}
                            </h4>
                            <GripVertical className="size-2.5 text-slate-400 opacity-0 group-hover:opacity-70 shrink-0 ml-0.5" />
                          </div>
                          {evt.displayTime && (
                            <p
                              className={`truncate text-[10px] font-normal leading-tight mt-0.5 ${styles.time}`}
                            >
                              {evt.displayTime}
                            </p>
                          )}
                        </div>

                        {/* ArmorIQ In-Action Badge & Trigger */}
                        {isArmoriq && (
                          <div className="mt-1 flex items-center justify-between gap-1 pt-0.5 border-t border-purple-200/50">
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-800 bg-emerald-100/90 px-1 py-0.2 rounded border border-emerald-300">
                              <Shield className="size-2.5 text-emerald-700" />
                              ArmorIQ Gate
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openArmoriqForEvent(evt);
                              }}
                              className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-slate-900 hover:bg-slate-800 text-white px-1.5 py-0.5 rounded shadow-2xs transition-colors cursor-pointer"
                              title="Click to trigger ArmorIQ Pre-Flight Guardrail"
                            >
                              <Zap className="size-2" />
                              <span>Action</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Event Add/Edit Modal */}
      <EventModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        event={selectedEvent}
        defaultDateKey={modalSlot.dateKey}
        defaultStartHour={modalSlot.startHour}
      />

      {/* ArmorIQ Guardrail Action Modal */}
      <ArmorIQActionModal
        isOpen={armoriqModalOpen}
        onClose={() => setArmoriqModalOpen(false)}
        event={armoriqActiveEvent || oct15Event}
      />
    </div>
  );
}
