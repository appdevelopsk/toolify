// Static public-holiday data for the workdays calculator, 2026–2027.
// Dates were compiled manually from official sources:
//  - US: 5 U.S.C. §6103 federal holidays (weekend holidays listed on the observed day)
//  - JP: 内閣府「国民の祝日」 (includes substitute holidays and the 2026 bridge holiday)
//  - UK: England & Wales bank holidays (substitute days for weekend Christmas/Boxing Day)
//  - DE: nationwide (bundesweit) public holidays only — state-specific holidays excluded
// Holiday dates vary by year; equinox days (JP) and Easter-based days (UK/DE) move every year.

export type HolidayCountry = "US" | "JP" | "UK" | "DE";

export const HOLIDAY_YEARS = [2026, 2027] as const;

export interface HolidayEntry {
  date: string; // ISO yyyy-mm-dd
  name: string; // English name (proper noun, shown as data)
}

export const HOLIDAY_PRESETS: Record<HolidayCountry, HolidayEntry[]> = {
  US: [
    { date: "2026-01-01", name: "New Year's Day" },
    { date: "2026-01-19", name: "Martin Luther King Jr. Day" },
    { date: "2026-02-16", name: "Washington's Birthday" },
    { date: "2026-05-25", name: "Memorial Day" },
    { date: "2026-06-19", name: "Juneteenth" },
    { date: "2026-07-03", name: "Independence Day (observed)" },
    { date: "2026-09-07", name: "Labor Day" },
    { date: "2026-10-12", name: "Columbus Day" },
    { date: "2026-11-11", name: "Veterans Day" },
    { date: "2026-11-26", name: "Thanksgiving Day" },
    { date: "2026-12-25", name: "Christmas Day" },
    { date: "2027-01-01", name: "New Year's Day" },
    { date: "2027-01-18", name: "Martin Luther King Jr. Day" },
    { date: "2027-02-15", name: "Washington's Birthday" },
    { date: "2027-05-31", name: "Memorial Day" },
    { date: "2027-06-18", name: "Juneteenth (observed)" },
    { date: "2027-07-05", name: "Independence Day (observed)" },
    { date: "2027-09-06", name: "Labor Day" },
    { date: "2027-10-11", name: "Columbus Day" },
    { date: "2027-11-11", name: "Veterans Day" },
    { date: "2027-11-25", name: "Thanksgiving Day" },
    { date: "2027-12-24", name: "Christmas Day (observed)" },
    { date: "2027-12-31", name: "New Year's Day 2028 (observed)" },
  ],
  JP: [
    { date: "2026-01-01", name: "New Year's Day (Ganjitsu)" },
    { date: "2026-01-12", name: "Coming of Age Day" },
    { date: "2026-02-11", name: "National Foundation Day" },
    { date: "2026-02-23", name: "Emperor's Birthday" },
    { date: "2026-03-20", name: "Vernal Equinox Day" },
    { date: "2026-04-29", name: "Showa Day" },
    { date: "2026-05-03", name: "Constitution Memorial Day" },
    { date: "2026-05-04", name: "Greenery Day" },
    { date: "2026-05-05", name: "Children's Day" },
    { date: "2026-05-06", name: "Substitute holiday (Constitution Memorial Day)" },
    { date: "2026-07-20", name: "Marine Day" },
    { date: "2026-08-11", name: "Mountain Day" },
    { date: "2026-09-21", name: "Respect for the Aged Day" },
    { date: "2026-09-22", name: "National holiday (bridge day)" },
    { date: "2026-09-23", name: "Autumnal Equinox Day" },
    { date: "2026-10-12", name: "Sports Day" },
    { date: "2026-11-03", name: "Culture Day" },
    { date: "2026-11-23", name: "Labor Thanksgiving Day" },
    { date: "2027-01-01", name: "New Year's Day (Ganjitsu)" },
    { date: "2027-01-11", name: "Coming of Age Day" },
    { date: "2027-02-11", name: "National Foundation Day" },
    { date: "2027-02-23", name: "Emperor's Birthday" },
    { date: "2027-03-21", name: "Vernal Equinox Day" },
    { date: "2027-03-22", name: "Substitute holiday (Vernal Equinox Day)" },
    { date: "2027-04-29", name: "Showa Day" },
    { date: "2027-05-03", name: "Constitution Memorial Day" },
    { date: "2027-05-04", name: "Greenery Day" },
    { date: "2027-05-05", name: "Children's Day" },
    { date: "2027-07-19", name: "Marine Day" },
    { date: "2027-08-11", name: "Mountain Day" },
    { date: "2027-09-20", name: "Respect for the Aged Day" },
    { date: "2027-09-23", name: "Autumnal Equinox Day" },
    { date: "2027-10-11", name: "Sports Day" },
    { date: "2027-11-03", name: "Culture Day" },
    { date: "2027-11-23", name: "Labor Thanksgiving Day" },
  ],
  UK: [
    { date: "2026-01-01", name: "New Year's Day" },
    { date: "2026-04-03", name: "Good Friday" },
    { date: "2026-04-06", name: "Easter Monday" },
    { date: "2026-05-04", name: "Early May bank holiday" },
    { date: "2026-05-25", name: "Spring bank holiday" },
    { date: "2026-08-31", name: "Summer bank holiday" },
    { date: "2026-12-25", name: "Christmas Day" },
    { date: "2026-12-28", name: "Boxing Day (substitute day)" },
    { date: "2027-01-01", name: "New Year's Day" },
    { date: "2027-03-26", name: "Good Friday" },
    { date: "2027-03-29", name: "Easter Monday" },
    { date: "2027-05-03", name: "Early May bank holiday" },
    { date: "2027-05-31", name: "Spring bank holiday" },
    { date: "2027-08-30", name: "Summer bank holiday" },
    { date: "2027-12-27", name: "Christmas Day (substitute day)" },
    { date: "2027-12-28", name: "Boxing Day (substitute day)" },
  ],
  DE: [
    { date: "2026-01-01", name: "New Year's Day (Neujahr)" },
    { date: "2026-04-03", name: "Good Friday (Karfreitag)" },
    { date: "2026-04-06", name: "Easter Monday (Ostermontag)" },
    { date: "2026-05-01", name: "Labour Day (Tag der Arbeit)" },
    { date: "2026-05-14", name: "Ascension Day (Christi Himmelfahrt)" },
    { date: "2026-05-25", name: "Whit Monday (Pfingstmontag)" },
    { date: "2026-10-03", name: "German Unity Day" },
    { date: "2026-12-25", name: "Christmas Day (1. Weihnachtstag)" },
    { date: "2026-12-26", name: "St. Stephen's Day (2. Weihnachtstag)" },
    { date: "2027-01-01", name: "New Year's Day (Neujahr)" },
    { date: "2027-03-26", name: "Good Friday (Karfreitag)" },
    { date: "2027-03-29", name: "Easter Monday (Ostermontag)" },
    { date: "2027-05-01", name: "Labour Day (Tag der Arbeit)" },
    { date: "2027-05-06", name: "Ascension Day (Christi Himmelfahrt)" },
    { date: "2027-05-17", name: "Whit Monday (Pfingstmontag)" },
    { date: "2027-10-03", name: "German Unity Day" },
    { date: "2027-12-25", name: "Christmas Day (1. Weihnachtstag)" },
    { date: "2027-12-26", name: "St. Stephen's Day (2. Weihnachtstag)" },
  ],
};
