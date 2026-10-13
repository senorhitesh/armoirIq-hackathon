// Utility functions for Planner / Schedule date calculations

export interface DayInfo {
  index: number; // 0 (Mon) to 6 (Sun)
  dateKey: string; // YYYY-MM-DD
  date: Date;
  weekday: string; // "Mon", "Tue", etc.
  dayNumber: number; // 1 to 31
  label: string; // "Mon 12"
  isToday: boolean;
  isCurrentMonth: boolean;
}

export interface MonthOption {
  year: number;
  monthIndex: number; // 0 to 11
  label: string; // "October 2026"
  key: string; // "2026-10"
  offset: number; // e.g. -3, -2, -1, 0, 1, 2, 3
  isCurrent: boolean;
  category: "past" | "current" | "upcoming";
}

/**
 * Format a Date into "YYYY-MM-DD" in local time
 */
export function formatDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parse a "YYYY-MM-DD" string into a local Date
 */
export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d || 1);
}

/**
 * Find the Monday for the week containing `date`
 */
export function getMondayOfWeek(d: Date): Date {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = date.getDay(); // 0 is Sun, 1 is Mon, ..., 6 is Sat
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Get 7 days (Monday through Sunday) for the week containing `selectedDate`
 */
export function getWeekDates(selectedDate: Date, today: Date = new Date()): DayInfo[] {
  const monday = getMondayOfWeek(selectedDate);
  const todayKey = formatDateKey(today);
  const selectedMonth = selectedDate.getMonth();

  const days: DayInfo[] = [];
  for (let i = 0; i < 7; i++) {
    const current = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
    const key = formatDateKey(current);
    const weekday = current.toLocaleDateString("en-US", { weekday: "short" });
    const dayNumber = current.getDate();

    days.push({
      index: i,
      dateKey: key,
      date: current,
      weekday,
      dayNumber,
      label: `${weekday} ${dayNumber}`,
      isToday: key === todayKey,
      isCurrentMonth: current.getMonth() === selectedMonth,
    });
  }
  return days;
}

/**
 * Generates dropdown month options:
 * Specifically includes the last 3 months from now, current month, and next 3 months
 */
export function getMonthDropdownOptions(baseDate: Date = new Date()): MonthOption[] {
  const options: MonthOption[] = [];
  const currentYear = baseDate.getFullYear();
  const currentMonth = baseDate.getMonth();

  // From 3 months ago to 3 months ahead
  for (let offset = -3; offset <= 3; offset++) {
    const d = new Date(currentYear, currentMonth + offset, 1);
    const year = d.getFullYear();
    const monthIndex = d.getMonth();
    const label = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const key = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;

    options.push({
      year,
      monthIndex,
      label,
      key,
      offset,
      isCurrent: offset === 0,
      category: offset < 0 ? "past" : offset === 0 ? "current" : "upcoming",
    });
  }
  return options;
}

/**
 * Format month title for a Date (e.g. "October 2026")
 */
export function formatMonthTitle(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

/**
 * Get the current time as fractional hour (e.g. 10:15 AM -> 10.25)
 */
export function getCurrentHourFloat(d: Date = new Date()): number {
  return d.getHours() + d.getMinutes() / 60;
}

/**
 * Generates the full 35-42 cell calendar grid for a given month
 */
export function getMonthGrid(selectedDate: Date, today: Date = new Date()) {
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const todayKey = formatDateKey(today);

  // First day of this month
  const firstDay = new Date(year, month, 1);
  // Monday of the week containing the first day
  const startMonday = getMondayOfWeek(firstDay);

  const grid: DayInfo[] = [];
  // 6 weeks * 7 days = 42 cells
  for (let i = 0; i < 42; i++) {
    const current = new Date(startMonday.getFullYear(), startMonday.getMonth(), startMonday.getDate() + i);
    const key = formatDateKey(current);
    const weekday = current.toLocaleDateString("en-US", { weekday: "short" });
    const dayNumber = current.getDate();

    grid.push({
      index: i % 7,
      dateKey: key,
      date: current,
      weekday,
      dayNumber,
      label: `${weekday} ${dayNumber}`,
      isToday: key === todayKey,
      isCurrentMonth: current.getMonth() === month,
    });
  }
  return grid;
}

/**
 * Format start hour and duration into readable range e.g. "10 AM – 11:30 AM"
 */
export function formatEventDisplayTime(start: number, duration: number): string {
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
}

