import { describe, it, expect } from 'vitest';
import { calculateCalendarTime } from '@/simulation';
import { InvalidArgumentError } from '@/domain/errors/DomainError';

describe('Simulation Calendar and Time', () => {
  it('calculates initial calendar time at elapsed 0 seconds', () => {
    const calendar = calculateCalendarTime(0);

    expect(calendar.year).toBe(2026);
    expect(calendar.month).toBe(10);
    expect(calendar.day).toBe(12);
    expect(calendar.hour).toBe(8);
    expect(calendar.minute).toBe(0);
    expect(calendar.second).toBe(0);
    expect(calendar.dayOfWeek).toBe('Monday');
    expect(calendar.timeString).toBe('08:00 AM');
    expect(calendar.dateString).toBe('Monday, Oct 12, 2026');
  });

  it('advances hours, minutes, and seconds deterministically', () => {
    // 3665 seconds = 1 hour, 1 minute, 5 seconds
    const calendar = calculateCalendarTime(3665);

    expect(calendar.hour).toBe(9);
    expect(calendar.minute).toBe(1);
    expect(calendar.second).toBe(5);
    expect(calendar.timeString).toBe('09:01 AM');
    expect(calendar.dayOfWeek).toBe('Monday');
  });

  it('correctly transitions from AM to PM', () => {
    // 4 hours = 14400 seconds -> 12:00 PM
    const noon = calculateCalendarTime(14400);
    expect(noon.hour).toBe(12);
    expect(noon.timeString).toBe('12:00 PM');

    // 8 hours = 28800 seconds -> 04:00 PM
    const afternoon = calculateCalendarTime(28800);
    expect(afternoon.hour).toBe(16);
    expect(afternoon.timeString).toBe('04:00 PM');
  });

  it('advances across midnight and updates calendar date and day of week', () => {
    // 16 hours = 57600 seconds -> 12:00 AM next day (Tuesday, Oct 13, 2026)
    const midnight = calculateCalendarTime(57600);
    expect(midnight.hour).toBe(0);
    expect(midnight.day).toBe(13);
    expect(midnight.dayOfWeek).toBe('Tuesday');
    expect(midnight.timeString).toBe('12:00 AM');
    expect(midnight.dateString).toBe('Tuesday, Oct 13, 2026');
  });

  it('supports custom base ISO timestamps', () => {
    const customStart = '2027-01-01T00:00:00.000Z';
    const calendar = calculateCalendarTime(3600, customStart);

    expect(calendar.year).toBe(2027);
    expect(calendar.month).toBe(1);
    expect(calendar.day).toBe(1);
    expect(calendar.hour).toBe(1);
    expect(calendar.timeString).toBe('01:00 AM');
  });

  it('rejects negative or non-finite simulation seconds', () => {
    expect(() => calculateCalendarTime(-1)).toThrow(InvalidArgumentError);
    expect(() => calculateCalendarTime(NaN)).toThrow(InvalidArgumentError);
    expect(() => calculateCalendarTime(Infinity)).toThrow(InvalidArgumentError);
  });

  it('rejects invalid start ISO strings', () => {
    expect(() => calculateCalendarTime(10, 'not-a-date')).toThrow(InvalidArgumentError);
  });
});
