import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DayInfo,
  formatDateKey,
  formatMonthTitle,
  getCurrentHourFloat,
  getMondayOfWeek,
  parseDateKey,
} from "@/lib/planner-utils";

export type { DayInfo };

export interface PlannerTask {
  id: string;
  title: string;
  completed: boolean;
  section: "today" | "upcoming";
}

export type EventColor = "blue" | "purple" | "green" | "amber" | "rose";

export interface PlannerEvent {
  id: string;
  title: string;
  date: string; // "YYYY-MM-DD" e.g. "2026-10-15"
  dayIndex?: number; // 0 (Mon) to 6 (Sun) for backward compatibility
  startHour: number; // e.g. 9 for 9 AM, 20 for 8 PM
  durationHours: number; // e.g. 0.5, 1, 1.5, 2
  displayTime: string; // e.g. "8 PM – 9 PM"
  color: EventColor;
  description?: string;
  isScheduledPost?: boolean;
  armoriqEnabled?: boolean;
  armoriqStatus?: "action-ready" | "in-action" | "verified" | "blocked";
  postPayload?: {
    platform: string;
    hookCopy: string;
    allocatedBudget: string;
  };
}

export const TIME_SLOTS = [
  { hour: 8, label: "8 AM" },
  { hour: 9, label: "9 AM" },
  { hour: 10, label: "10 AM" },
  { hour: 11, label: "11 AM" },
  { hour: 12, label: "12 PM" },
  { hour: 13, label: "1 PM" },
  { hour: 14, label: "2 PM" },
  { hour: 15, label: "3 PM" },
  { hour: 16, label: "4 PM" },
  { hour: 17, label: "5 PM" },
  { hour: 18, label: "6 PM" },
  { hour: 19, label: "7 PM" },
  { hour: 20, label: "8 PM" },
];

export const DAYS = [
  { index: 0, weekday: "Mon", dayNumber: 1, label: "Mon", isToday: false },
  { index: 1, weekday: "Tue", dayNumber: 2, label: "Tue", isToday: false },
  { index: 2, weekday: "Wed", dayNumber: 3, label: "Wed", isToday: false },
  { index: 3, weekday: "Thu", dayNumber: 4, label: "Thu", isToday: false },
  { index: 4, weekday: "Fri", dayNumber: 5, label: "Fri", isToday: false },
  { index: 5, weekday: "Sat", dayNumber: 6, label: "Sat", isToday: false },
  { index: 6, weekday: "Sun", dayNumber: 7, label: "Sun", isToday: false },
];

function getInitialEvents(baseDate: Date = new Date()): PlannerEvent[] {
  const mon = getMondayOfWeek(baseDate);
  const getDayKey = (dayOffset: number) => {
    const d = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + dayOffset);
    return formatDateKey(d);
  };

  return [
    // Mon
    {
      id: "evt-1",
      title: "Campaign Standup",
      date: getDayKey(0),
      dayIndex: 0,
      startHour: 9,
      durationHours: 0.5,
      displayTime: "9 AM",
      color: "blue",
    },
    {
      id: "evt-2",
      title: "Roadmap & Creative Review",
      date: getDayKey(0),
      dayIndex: 0,
      startHour: 10,
      durationHours: 1.5,
      displayTime: "10 AM – 11:30 AM",
      color: "purple",
    },
    {
      id: "evt-3",
      title: "Lunch with Influencer Lead",
      date: getDayKey(0),
      dayIndex: 0,
      startHour: 13,
      durationHours: 0.75,
      displayTime: "1 PM",
      color: "amber",
    },
    // Tue (Today or day 1)
    {
      id: "evt-4",
      title: "Deep Work: Viral Ad Scripts",
      date: getDayKey(1),
      dayIndex: 1,
      startHour: 10,
      durationHours: 2,
      displayTime: "10 AM – 12 PM",
      color: "green",
    },
    {
      id: "evt-5",
      title: "Interview: Creative Director",
      date: getDayKey(1),
      dayIndex: 1,
      startHour: 15,
      durationHours: 0.75,
      displayTime: "3 PM",
      color: "rose",
    },
    // Wed
    {
      id: "evt-6",
      title: "Standup",
      date: getDayKey(2),
      dayIndex: 2,
      startHour: 9,
      durationHours: 0.5,
      displayTime: "9 AM",
      color: "blue",
    },
    {
      id: "evt-7",
      title: "1:1 Strategy with Ana",
      date: getDayKey(2),
      dayIndex: 2,
      startHour: 12,
      durationHours: 0.75,
      displayTime: "12 PM",
      color: "rose",
    },
    {
      id: "evt-8",
      title: "Design & Copy Review",
      date: getDayKey(2),
      dayIndex: 2,
      startHour: 14,
      durationHours: 1.5,
      displayTime: "2 PM – 3:30 PM",
      color: "purple",
    },
    // Thu
    {
      id: "evt-9",
      title: "Marketing Sync",
      date: getDayKey(3),
      dayIndex: 3,
      startHour: 9,
      durationHours: 0.5,
      displayTime: "9 AM",
      color: "blue",
    },
    {
      id: "evt-10",
      title: "Global Partner Call",
      date: getDayKey(3),
      dayIndex: 3,
      startHour: 11,
      durationHours: 0.75,
      displayTime: "11 AM",
      color: "blue",
    },
    {
      id: "evt-11",
      title: "High-Priority Focus Block",
      date: getDayKey(3),
      dayIndex: 3,
      startHour: 14,
      durationHours: 1.5,
      displayTime: "2 PM – 3:30 PM",
      color: "green",
    },
    // Thu 8 PM: Scheduled Viral Post governed by ArmorIQ
    {
      id: "evt-armoriq-15oct-8pm",
      title: "🚀 Scheduled Post: Q4 Viral Launch",
      date: getDayKey(3), // Thursday Oct 15!
      dayIndex: 3,
      startHour: 20, // 8 PM!
      durationHours: 1,
      displayTime: "8 PM – 9 PM",
      color: "purple",
      description: "Stop building products nobody asked for. Here is the 3-step validation framework that saved our company $240,000 in wasted ad spend.",
      isScheduledPost: true,
      armoriqEnabled: true,
      armoriqStatus: "action-ready",
      postPayload: {
        platform: "𝕏 (Twitter) & LinkedIn",
        hookCopy: "Stop building products nobody asked for. Here is the 3-step validation framework that saved our company $240,000 in wasted ad spend.",
        allocatedBudget: "$240.00",
      },
    },
    // Fri
    {
      id: "evt-12",
      title: "Weekly Wrap & Retro",
      date: getDayKey(4),
      dayIndex: 4,
      startHour: 9,
      durationHours: 0.5,
      displayTime: "9 AM",
      color: "blue",
    },
    {
      id: "evt-13",
      title: "Gym / Wellness",
      date: getDayKey(4),
      dayIndex: 4,
      startHour: 10.5,
      durationHours: 0.75,
      displayTime: "10:30 AM",
      color: "green",
    },
    {
      id: "evt-14",
      title: "Team Demo & Drinks",
      date: getDayKey(4),
      dayIndex: 4,
      startHour: 16,
      durationHours: 1,
      displayTime: "4 PM",
      color: "amber",
    },
  ];
}

const INITIAL_TASKS: PlannerTask[] = [
  { id: "task-1", title: "Standup", completed: false, section: "today" },
  { id: "task-2", title: "Book flights to Lisbon", completed: true, section: "today" },
  { id: "task-3", title: "Reply to Sam", completed: false, section: "today" },
  { id: "task-4", title: "Draft the Q4 agenda", completed: false, section: "today" },
  { id: "task-5", title: "Renew passport", completed: false, section: "today" },
  { id: "task-6", title: "Send the invoice", completed: false, section: "upcoming" },
  { id: "task-7", title: "Plan the offsite", completed: false, section: "upcoming" },
];

interface PlannerState {
  tasks: PlannerTask[];
  events: PlannerEvent[];
  viewMode: "week" | "day" | "month";
  railActive: "tasks" | "links" | "calendar";
  selectedDate: string; // "YYYY-MM-DD"
  monthTitle: string; // e.g. "October 2026"
  todayDayIndex: number;
  currentTimeHour: number;
  selectedEventId: string | null;

  // Actions
  setSelectedDate: (dateKey: string) => void;
  goToToday: () => void;
  goToPrevious: () => void;
  goToNext: () => void;
  goToMonth: (year: number, monthIndex: number) => void;
  setViewMode: (mode: "week" | "day" | "month") => void;
  setRailActive: (rail: "tasks" | "links" | "calendar") => void;
  setSelectedEventId: (id: string | null) => void;

  toggleTask: (id: string) => void;
  addTask: (section: "today" | "upcoming", title: string) => void;
  deleteTask: (id: string) => void;

  addEvent: (event: Omit<PlannerEvent, "id">) => void;
  updateEvent: (id: string, updates: Partial<PlannerEvent>) => void;
  deleteEvent: (id: string) => void;

  // ArmorIQ Guardrail Action State
  armoriqModalOpen: boolean;
  armoriqActiveEvent: PlannerEvent | null;
  setArmoriqModalOpen: (open: boolean) => void;
  setArmoriqActiveEvent: (event: PlannerEvent | null) => void;
  openArmoriqForEvent: (event: PlannerEvent) => void;

  resetToDefaults: () => void;
}

const initialDate = new Date();
const initialDateKey = formatDateKey(initialDate);
const initialMonthTitle = formatMonthTitle(initialDate);
const initialHour = getCurrentHourFloat(initialDate);

export const usePlannerStore = create<PlannerState>()(
  persist(
    (set, get) => ({
      tasks: INITIAL_TASKS,
      events: getInitialEvents(initialDate),
      viewMode: "week",
      railActive: "tasks",
      selectedDate: initialDateKey,
      monthTitle: initialMonthTitle,
      todayDayIndex: (initialDate.getDay() + 6) % 7,
      currentTimeHour: initialHour,
      selectedEventId: null,

      setSelectedDate: (dateKey: string) => {
        const d = parseDateKey(dateKey);
        set({
          selectedDate: dateKey,
          monthTitle: formatMonthTitle(d),
        });
      },

      goToToday: () => {
        const today = new Date();
        set({
          selectedDate: formatDateKey(today),
          monthTitle: formatMonthTitle(today),
          todayDayIndex: (today.getDay() + 6) % 7,
          currentTimeHour: getCurrentHourFloat(today),
        });
      },

      goToPrevious: () => {
        const { selectedDate, viewMode } = get();
        const d = parseDateKey(selectedDate);
        if (viewMode === "day") {
          d.setDate(d.getDate() - 1);
        } else if (viewMode === "month") {
          d.setMonth(d.getMonth() - 1);
        } else {
          // week
          d.setDate(d.getDate() - 7);
        }
        set({
          selectedDate: formatDateKey(d),
          monthTitle: formatMonthTitle(d),
        });
      },

      goToNext: () => {
        const { selectedDate, viewMode } = get();
        const d = parseDateKey(selectedDate);
        if (viewMode === "day") {
          d.setDate(d.getDate() + 1);
        } else if (viewMode === "month") {
          d.setMonth(d.getMonth() + 1);
        } else {
          // week
          d.setDate(d.getDate() + 7);
        }
        set({
          selectedDate: formatDateKey(d),
          monthTitle: formatMonthTitle(d),
        });
      },

      goToMonth: (year: number, monthIndex: number) => {
        const now = new Date();
        const isCurrentMonth =
          now.getFullYear() === year && now.getMonth() === monthIndex;
        const targetDate = isCurrentMonth
          ? now
          : new Date(year, monthIndex, 1);

        set({
          selectedDate: formatDateKey(targetDate),
          monthTitle: formatMonthTitle(targetDate),
        });
      },

      setViewMode: (viewMode) => set({ viewMode }),

      setRailActive: (railActive) => set({ railActive }),

      setSelectedEventId: (selectedEventId) => set({ selectedEventId }),

      toggleTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, completed: !task.completed } : task
          ),
        })),

      addTask: (section, title) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              id: `task-${Date.now()}`,
              title,
              completed: false,
              section,
            },
          ],
        })),

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),

      // ArmorIQ Initial State & Actions
      armoriqModalOpen: false,
      armoriqActiveEvent: null,
      setArmoriqModalOpen: (armoriqModalOpen) => set({ armoriqModalOpen }),
      setArmoriqActiveEvent: (armoriqActiveEvent) => set({ armoriqActiveEvent }),
      openArmoriqForEvent: (event) =>
        set({ armoriqActiveEvent: event, armoriqModalOpen: true }),

      addEvent: (event) => {
        const isArmoriqTarget =
          event.armoriqEnabled ||
          ((event.date.endsWith("-10-15") || event.date === "2026-10-15") && event.startHour === 20) ||
          event.title.toLowerCase().includes("scheduled") ||
          event.title.toLowerCase().includes("launch");

        const newEvt: PlannerEvent = {
          ...event,
          id: `evt-${Date.now()}`,
          armoriqEnabled: isArmoriqTarget,
          armoriqStatus: isArmoriqTarget ? (event.armoriqStatus || "action-ready") : undefined,
        };

        set((state) => ({
          events: [...state.events, newEvt],
        }));
      },

      updateEvent: (id, updates) =>
        set((state) => ({
          events: state.events.map((evt) => {
            if (evt.id !== id) return evt;
            const updated = { ...evt, ...updates };
            const isArmoriqTarget =
              updated.armoriqEnabled ||
              ((updated.date.endsWith("-10-15") || updated.date === "2026-10-15") && updated.startHour === 20) ||
              updated.title.toLowerCase().includes("scheduled") ||
              updated.title.toLowerCase().includes("launch");

            return {
              ...updated,
              armoriqEnabled: isArmoriqTarget,
              armoriqStatus: isArmoriqTarget ? (updated.armoriqStatus || "action-ready") : updated.armoriqStatus,
            };
          }),
        })),

      deleteEvent: (id) =>
        set((state) => ({
          events: state.events.filter((evt) => evt.id !== id),
        })),

      resetToDefaults: () => {
        const now = new Date();
        set({
          tasks: INITIAL_TASKS,
          events: getInitialEvents(now),
          viewMode: "week",
          railActive: "tasks",
          selectedDate: formatDateKey(now),
          monthTitle: formatMonthTitle(now),
          todayDayIndex: (now.getDay() + 6) % 7,
          currentTimeHour: getCurrentHourFloat(now),
          selectedEventId: null,
        });
      },
    }),
    {
      name: "adloop-planner-store-v3",
    }
  )
);
