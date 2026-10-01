// Bikram Sambat (BS) date conversion utility
// Reference: BS 2075-01-01 (Baishakh 1) = AD 2018-04-14

const BS_MONTH_DAYS: Record<number, number[]> = {
  2075: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2076: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2077: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2078: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2079: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2080: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2081: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2082: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2083: [31, 31, 32, 31, 32, 30, 30, 30, 29, 29, 30, 30],
  2084: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2085: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2086: [31, 31, 32, 31, 32, 30, 30, 30, 29, 30, 30, 30],
  2087: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2088: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2089: [31, 31, 32, 31, 32, 30, 30, 30, 29, 30, 30, 30],
  2090: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
};

export const BS_MONTH_NAMES = [
  "Baishakh",
  "Jestha",
  "Ashadh",
  "Shrawan",
  "Bhadra",
  "Ashwin",
  "Kartik",
  "Mangsir",
  "Poush",
  "Magh",
  "Falgun",
  "Chaitra",
];

export const BS_MONTH_NAMES_NP = [
  "बैशाख",
  "जेठ",
  "असार",
  "साउन",
  "भदौ",
  "असोज",
  "कार्तिक",
  "मंसिर",
  "पुष",
  "माघ",
  "फागुन",
  "चैत",
];

// Reference: BS 2075-01-01 = AD 2018-04-14
const REFERENCE_AD = new Date(2018, 3, 14); // April 14, 2018 (month is 0-indexed)
const REFERENCE_BS_YEAR = 2075;

function getTotalDaysInBsYear(year: number): number {
  const months = BS_MONTH_DAYS[year];
  if (!months) return 365;
  return months.reduce((sum, d) => sum + d, 0);
}

export function adToBs(date: Date): { year: number; month: number; day: number; monthName: string } {
  // Calculate days since reference date
  const diffMs = date.getTime() - REFERENCE_AD.getTime();
  let totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  let bsYear = REFERENCE_BS_YEAR;
  let bsMonth = 0; // 0-indexed
  let bsDay = 1;

  // Advance through years
  while (true) {
    const daysInYear = getTotalDaysInBsYear(bsYear);
    if (totalDays >= daysInYear) {
      totalDays -= daysInYear;
      bsYear++;
    } else {
      break;
    }
  }

  // Advance through months
  const months = BS_MONTH_DAYS[bsYear];
  while (bsMonth < 12 && totalDays >= months[bsMonth]) {
    totalDays -= months[bsMonth];
    bsMonth++;
  }

  bsDay = totalDays + 1;

  return {
    year: bsYear,
    month: bsMonth + 1, // 1-indexed
    day: bsDay,
    monthName: BS_MONTH_NAMES[bsMonth],
  };
}

export function formatBsDate(date: Date): string {
  const { year, month, day, monthName } = adToBs(date);
  return `${day} ${monthName} ${year}`;
}

export function todayBsDate(): string {
  return formatBsDate(new Date());
}
