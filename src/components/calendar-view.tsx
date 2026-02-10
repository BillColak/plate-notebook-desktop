import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { getNotesByDateRange } from "@/actions/features";
import type { NotesByDateItem } from "@/db/schema";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarView({
  onNavigate,
}: {
  onNavigate?: (noteId: string) => void;
}) {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(
    new Date().getDate()
  );
  const [notes, setNotes] = useState<NotesByDateItem[]>([]);
  const [noteDays, setNoteDays] = useState<Set<number>>(new Set());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const loadNotes = useCallback(async () => {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0, 23, 59, 59);
    const startTs = Math.floor(start.getTime() / 1000);
    const endTs = Math.floor(end.getTime() / 1000);

    const result = await getNotesByDateRange(startTs, endTs);
    setNotes(result);

    // Compute which days have notes
    const days = new Set<number>();
    for (const note of result) {
      const d = new Date(note.updatedAt * 1000);
      if (d.getMonth() === month && d.getFullYear() === year) {
        days.add(d.getDate());
      }
      const c = new Date(note.createdAt * 1000);
      if (c.getMonth() === month && c.getFullYear() === year) {
        days.add(c.getDate());
      }
    }
    setNoteDays(days);
  }, [year, month]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === month;

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  const goToday = () => {
    setCurrentDate(new Date());
    setSelectedDay(today.getDate());
  };

  // Filter notes for selected day
  const selectedNotes = selectedDay
    ? notes.filter((n) => {
        const u = new Date(n.updatedAt * 1000);
        const c = new Date(n.createdAt * 1000);
        return (
          (u.getDate() === selectedDay &&
            u.getMonth() === month &&
            u.getFullYear() === year) ||
          (c.getDate() === selectedDay &&
            c.getMonth() === month &&
            c.getFullYear() === year)
        );
      })
    : [];

  // Dedupe by id
  const uniqueNotes = Array.from(
    new Map(selectedNotes.map((n) => [n.id, n])).values()
  );

  // Build calendar grid cells
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="flex h-full flex-col items-center p-6">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={prevMonth}
            className="rounded-md p-1.5 hover:bg-accent"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">
              {currentDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </h2>
            {!isCurrentMonth && (
              <button
                type="button"
                onClick={goToday}
                className="rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary hover:bg-primary/20"
              >
                Today
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={nextMonth}
            className="rounded-md p-1.5 hover:bg-accent"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAYS.map((d) => (
            <div
              key={d}
              className="py-1 text-center text-xs font-medium text-muted-foreground"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-0.5">
          {cells.map((day, i) => {
            if (day === null) {
              return <div key={`empty-${i}`} className="h-10" />;
            }
            const isToday = isCurrentMonth && day === today.getDate();
            const hasNotes = noteDays.has(day);
            const isSelected = day === selectedDay;

            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={`relative flex h-10 items-center justify-center rounded-md text-sm transition-colors
                  ${isSelected ? "bg-primary text-primary-foreground" : "hover:bg-accent"}
                  ${isToday && !isSelected ? "font-bold text-primary" : ""}
                `}
              >
                {day}
                {hasNotes && (
                  <span
                    className={`absolute bottom-1 h-1 w-1 rounded-full ${
                      isSelected ? "bg-primary-foreground" : "bg-primary"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected day notes */}
        <div className="mt-6">
          {selectedDay && (
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
              {new Date(year, month, selectedDay).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </h3>
          )}
          {uniqueNotes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {selectedDay ? "No notes on this day" : "Select a day to view notes"}
            </p>
          ) : (
            <div className="space-y-1.5">
              {uniqueNotes.map((note) => (
                <button
                  key={note.id}
                  type="button"
                  onClick={() => onNavigate?.(note.id)}
                  className="flex w-full items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-left text-sm hover:bg-accent transition-colors"
                >
                  <span className="text-base">
                    {note.emoji ?? "📝"}
                  </span>
                  <span className="flex-1 truncate">{note.title}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(note.updatedAt * 1000).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
