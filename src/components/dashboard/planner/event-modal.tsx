"use client";

import { useState, useEffect, useRef } from "react";
import { X, Trash2, Calendar, Clock, Palette, GripHorizontal } from "lucide-react";
import {
  EventColor,
  PlannerEvent,
  usePlannerStore,
  TIME_SLOTS,
} from "@/stores/planner-store";
import { formatDateKey, parseDateKey } from "@/lib/planner-utils";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: PlannerEvent | null;
  defaultDayIndex?: number;
  defaultDateKey?: string;
  defaultStartHour?: number;
}

export default function EventModal({
  isOpen,
  onClose,
  event,
  defaultDateKey,
  defaultStartHour = 10,
}: EventModalProps) {
  const addEvent = usePlannerStore((state) => state.addEvent);
  const updateEvent = usePlannerStore((state) => state.updateEvent);
  const deleteEvent = usePlannerStore((state) => state.deleteEvent);
  const selectedDate = usePlannerStore((state) => state.selectedDate);

  const initialDate = event?.date || defaultDateKey || selectedDate || formatDateKey(new Date());

  const [title, setTitle] = useState(event?.title || "");
  const [dateKey, setDateKey] = useState(initialDate);
  const [startHour, setStartHour] = useState(event?.startHour ?? defaultStartHour);
  const [durationHours, setDurationHours] = useState(event?.durationHours ?? 1);
  const [color, setColor] = useState<EventColor>(event?.color || "blue");

  // Draggable Modal Offset
  const [modalPos, setModalPos] = useState({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const startMouseRef = useRef({ x: 0, y: 0 });
  const startPosRef = useRef({ x: 0, y: 0 });

  // Reset & keep state in sync when opened or when event changes
  useEffect(() => {
    if (isOpen) {
      setTitle(event?.title || "");
      setDateKey(event?.date || defaultDateKey || selectedDate || formatDateKey(new Date()));
      setStartHour(event?.startHour ?? defaultStartHour);
      setDurationHours(event?.durationHours ?? 1);
      setColor(event?.color || "blue");
      setModalPos({ x: 0, y: 0 });
    }
  }, [isOpen, event, defaultDateKey, defaultStartHour, selectedDate]);

  if (!isOpen) return null;

  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    startMouseRef.current = { x: e.clientX, y: e.clientY };
    startPosRef.current = { ...modalPos };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = moveEvent.clientX - startMouseRef.current.x;
      const dy = moveEvent.clientY - startMouseRef.current.y;
      setModalPos({
        x: startPosRef.current.x + dx,
        y: startPosRef.current.y + dy,
      });
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const formatDisplayTime = (start: number, duration: number) => {
    const end = start + duration;
    const formatHour = (h: number) => {
      const whole = Math.floor(h);
      const mins = Math.round((h - whole) * 60);
      const period = whole >= 12 ? "PM" : "AM";
      const displayHour = whole > 12 ? whole - 12 : whole === 0 ? 12 : whole;
      return mins > 0
        ? `${displayHour}:${mins.toString().padStart(2, "0")} ${period}`
        : `${displayHour} ${period}`;
    };

    if (duration <= 0.5) {
      return formatHour(start);
    }
    return `${formatHour(start)} – ${formatHour(end)}`;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const displayTime = formatDisplayTime(startHour, durationHours);
    const parsedDate = parseDateKey(dateKey);
    const dayIndex = (parsedDate.getDay() + 6) % 7; // Monday = 0

    if (event) {
      updateEvent(event.id, {
        title: title.trim(),
        date: dateKey,
        dayIndex,
        startHour,
        durationHours,
        displayTime,
        color,
      });
    } else {
      addEvent({
        title: title.trim(),
        date: dateKey,
        dayIndex,
        startHour,
        durationHours,
        displayTime,
        color,
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (event) {
      deleteEvent(event.id);
      onClose();
    }
  };

  const COLOR_OPTIONS: { key: EventColor; label: string; bg: string }[] = [
    { key: "blue", label: "Blue", bg: "bg-blue-500" },
    { key: "purple", label: "Purple", bg: "bg-purple-500" },
    { key: "green", label: "Green", bg: "bg-emerald-500" },
    { key: "amber", label: "Amber", bg: "bg-amber-500" },
    { key: "rose", label: "Rose", bg: "bg-rose-500" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        style={{
          transform: `translate(${modalPos.x}px, ${modalPos.y}px)`,
        }}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 transition-shadow"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Draggable Modal Header */}
        <div
          onMouseDown={handleHeaderMouseDown}
          className="flex items-center justify-between pb-4 border-b border-slate-100 cursor-grab active:cursor-grabbing select-none"
          title="Drag to reposition window"
        >
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="size-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                {event ? "Edit Event" : "Create New Event"}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <GripHorizontal className="size-4 text-slate-300 hover:text-slate-500 transition-colors" />
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Event Title
            </label>
            <input
              type="text"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Design review, Viral script brainstorming"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar className="size-3 text-slate-400" /> Date
              </label>
              <input
                type="date"
                value={dateKey}
                onChange={(e) => setDateKey(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Clock className="size-3 text-slate-400" /> Start Time
              </label>
              <select
                value={startHour}
                onChange={(e) => setStartHour(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                {TIME_SLOTS.map((slot) => (
                  <option key={slot.hour} value={slot.hour}>
                    {slot.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Duration
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { val: 0.5, label: "30m" },
                { val: 0.75, label: "45m" },
                { val: 1, label: "1h" },
                { val: 1.5, label: "1.5h" },
                { val: 2, label: "2h" },
              ].map((item) => (
                <button
                  type="button"
                  key={item.val}
                  onClick={() => setDurationHours(item.val)}
                  className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    durationHours === item.val
                      ? "border-blue-500 bg-blue-50 text-blue-700 shadow-2xs font-semibold"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Palette className="size-3 text-slate-400" /> Color Accent
            </label>
            <div className="flex items-center gap-3">
              {COLOR_OPTIONS.map((c) => (
                <button
                  type="button"
                  key={c.key}
                  onClick={() => setColor(c.key)}
                  className={`size-7 rounded-full transition-all flex items-center justify-center ${
                    c.bg
                  } ${
                    color === c.key
                      ? "ring-2 ring-slate-900 ring-offset-2 scale-110"
                      : "opacity-70 hover:opacity-100"
                  }`}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {event ? (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 px-2 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
              >
                <Trash2 className="size-3.5" />
                <span>Delete</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-medium text-white shadow-2xs hover:bg-blue-700 transition-colors"
              >
                {event ? "Save Changes" : "Create Event"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
