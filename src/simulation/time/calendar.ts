import { CalendarTime } from '../core/types';
import { InvalidArgumentError } from '../../domain/errors/DomainError';

export const DEFAULT_SIMULATION_START_ISO = '2026-10-12T08:00:00.000Z';

const DAY_NAMES: ReadonlyArray<CalendarTime['dayOfWeek']> = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/**
 * Calculates in-game calendar representation from elapsed simulation seconds.
 * Strictly deterministic; operates independently of host computer system clock.
 */
export function calculateCalendarTime(
  elapsedSeconds: number,
  startIso = DEFAULT_SIMULATION_START_ISO
): CalendarTime {
  if (!Number.isFinite(elapsedSeconds) || elapsedSeconds < 0) {
    throw new InvalidArgumentError(
      `Elapsed simulation seconds must be a non-negative finite number, received: ${elapsedSeconds}`
    );
  }

  const startTimestamp = Date.parse(startIso);
  if (Number.isNaN(startTimestamp)) {
    throw new InvalidArgumentError(`Invalid start ISO string: ${startIso}`);
  }

  // Calculate destination timestamp in milliseconds
  const currentTimestamp = startTimestamp + Math.floor(elapsedSeconds) * 1000;
  const date = new Date(currentTimestamp);

  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1; // 1-12
  const day = date.getUTCDate();
  const hour = date.getUTCHours();
  const minute = date.getUTCMinutes();
  const second = date.getUTCSeconds();
  const dayOfWeekIndex = date.getUTCDay();
  const dayOfWeek = DAY_NAMES[dayOfWeekIndex] ?? 'Monday';

  // 12-hour formatted time string (e.g. "08:00 AM")
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  const hourPadded = displayHour.toString().padStart(2, '0');
  const minutePadded = minute.toString().padStart(2, '0');
  const timeString = `${hourPadded}:${minutePadded} ${period}`;

  // Date string (e.g. "Monday, Oct 12, 2026")
  const monthName = MONTH_NAMES[month - 1] ?? 'Oct';
  const dateString = `${dayOfWeek}, ${monthName} ${day}, ${year}`;

  return {
    iso: date.toISOString(),
    year,
    month,
    day,
    hour,
    minute,
    second,
    dayOfWeek,
    timeString,
    dateString,
  };
}
