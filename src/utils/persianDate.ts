/**
 * Persian (Jalali) Calendar and Currency formatting utilities
 */

const JALALI_MONTH_NAMES = [
  'فروردین', 'اردیبهشت', 'خرداد',
  'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر',
  'دی', 'بهمن', 'اسفند'
];

const WEEKDAY_NAMES = [
  'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'
];

/**
 * Converts Gregorian date to Jalali date
 */
export function gregorianToJalali(gy: number, gm: number, gd: number): [number, number, number] {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let gy2 = (gm > 2) ? (gy + 1) : gy;
  let days = 355666 + (365 * gy) + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) + gd + g_d_m[gm - 1];
  let jy = -1595 + (33 * Math.floor(days / 12053));
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let jm: number;
  let jd: number;
  if (days < 186) {
    jm = 1 + Math.floor(days / 31);
    jd = 1 + (days % 31);
  } else {
    jm = 7 + Math.floor((days - 186) / 30);
    jd = 1 + ((days - 186) % 30);
  }
  return [jy, jm, jd];
}

/**
 * Format ISO date string (YYYY-MM-DD) to Persian formatted date
 */
export function formatPersianDate(dateStr: string, options?: { showMonthName?: boolean; showDayOfWeek?: boolean }): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  const [jy, jm, jd] = gregorianToJalali(date.getFullYear(), date.getMonth() + 1, date.getDate());
  
  if (options?.showMonthName) {
    const monthName = JALALI_MONTH_NAMES[jm - 1];
    if (options.showDayOfWeek) {
      const dayOfWeek = WEEKDAY_NAMES[date.getDay()];
      return `${dayOfWeek} ${jd} ${monthName} ${jy}`;
    }
    return `${jd} ${monthName} ${jy}`;
  }

  const mm = jm < 10 ? `0${jm}` : `${jm}`;
  const dd = jd < 10 ? `0${jd}` : `${jd}`;
  return `${jy}/${mm}/${dd}`;
}

/**
 * Get current Jalali month and year
 */
export function getCurrentJalali(): { year: number; month: number; day: number; monthName: string } {
  const now = new Date();
  const [year, month, day] = gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
  return {
    year,
    month,
    day,
    monthName: JALALI_MONTH_NAMES[month - 1]
  };
}

/**
 * Format currency amount with comma grouping and optional currency symbol
 */
export function formatCurrency(
  amount: number | undefined | null,
  currency: string = 'تومان',
  showSymbol: boolean = true
): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return showSymbol ? `0 ${currency}` : '0';
  }
  
  const isNegative = amount < 0;
  const absVal = Math.abs(Math.round(amount));
  const formatted = absVal.toLocaleString('en-US'); // provides comma grouping 1,000,000
  
  const sign = isNegative ? '-' : '';
  if (showSymbol) {
    return `${sign}${formatted} ${currency}`;
  }
  return `${sign}${formatted}`;
}

/**
 * Format Persian digits (e.g. 123 -> ۱۲۳)
 */
export function toPersianDigits(n: number | string): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(n).replace(/[0-9]/g, (w) => persianDigits[parseInt(w, 10)]);
}

/**
 * Format bank card number as 4-4-4-4
 */
export function formatCardNumber(card: string | undefined): string {
  if (!card) return '';
  const clean = card.replace(/\D/g, '');
  return clean.replace(/(\d{4})(?=\d)/g, '$1 - ');
}

export { JALALI_MONTH_NAMES, WEEKDAY_NAMES };
