// Pure cost logic for the meeting cost calculator. The copy in messages/*.json
// quotes this formula and its worked example (8 people × $100,000 ÷ 2,080 × 1 h
// × 1.4 = $538), so keep text and constants in step.

/** Work hours per year used to turn an annual salary into an hourly rate: 40 h × 52 weeks. */
export const ANNUAL_HOURS = 2080;

export interface MeetingCost {
  /** Total loaded labor cost of the meeting. */
  totalCost: number;
  /** Loaded labor cost of all attendees for one minute. */
  costPerMinute: number;
  /** Attendees × hours. */
  personHours: number;
}

export function hourlyRate(annualSalary: number): number {
  return annualSalary / ANNUAL_HOURS;
}

/** Returns null when any input is not a usable number. `hours` may be 0 (running timer at 0:00). */
export function meetingCost(attendees: number, annualSalary: number, hours: number, multiplier: number): MeetingCost | null {
  if (![attendees, annualSalary, hours, multiplier].every(Number.isFinite)) return null;
  if (attendees < 1 || annualSalary <= 0 || hours < 0 || multiplier <= 0) return null;
  const costPerHour = attendees * hourlyRate(annualSalary) * multiplier;
  return {
    totalCost: costPerHour * hours,
    costPerMinute: costPerHour / 60,
    personHours: attendees * hours,
  };
}
