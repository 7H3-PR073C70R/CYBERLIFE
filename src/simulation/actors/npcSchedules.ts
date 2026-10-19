import { NpcProfile, NpcScheduleEntry } from './types';

/**
 * Determines whether a given hour falls within a startHour -> endHour window.
 * Supports windows that wrap around midnight (e.g. 22:00 to 06:00).
 */
export function isHourInWindow(hour: number, startHour: number, endHour: number): boolean {
  if (startHour <= endHour) {
    return hour >= startHour && hour < endHour;
  }
  // Wraps around midnight (e.g., 20 to 6)
  return hour >= startHour || hour < endHour;
}

/**
 * Returns the active schedule entry for an NPC given the current simulation hour (0-23).
 * Falls back to the first schedule entry if none matches.
 */
export function getNpcActiveSchedule(
  profile: NpcProfile,
  simulationHour: number
): NpcScheduleEntry {
  if (!profile.schedule || profile.schedule.length === 0) {
    return {
      startHour: 0,
      endHour: 24,
      locationId: 'neighborhood',
      position: [0, 0, 0],
      yaw: 0,
      activity: 'Standing in the neighborhood.',
      animationState: 'IDLE',
    };
  }

  const matching = profile.schedule.find(entry =>
    isHourInWindow(simulationHour, entry.startHour, entry.endHour)
  );

  return matching ?? profile.schedule[0]!;
}

/**
 * Returns all NPCs whose active schedule matches the specified locationId for the given simulation hour.
 */
export function getNpcsForLocation(
  profiles: readonly NpcProfile[],
  locationId: string,
  simulationHour: number
): readonly { profile: NpcProfile; schedule: NpcScheduleEntry }[] {
  const result: { profile: NpcProfile; schedule: NpcScheduleEntry }[] = [];

  for (const profile of profiles) {
    const active = getNpcActiveSchedule(profile, simulationHour);
    if (active.locationId === locationId) {
      result.push({ profile, schedule: active });
    }
  }

  return result;
}
