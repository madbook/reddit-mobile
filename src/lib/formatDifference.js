const SECONDS = 1000;
const MINUTES = 60 * SECONDS;
const HOURS = 60 * MINUTES;
const DAYS = 24 * HOURS;
const MONTHS = 30 * DAYS; // ignoring odd 31 / 28 day months
const YEARS = 365 * DAYS; // ignoring leap years ...

export const differenceFromNow = unixTime => {
  const now = new Date();
  now.setMinutes(now.getMinutes(), -1 * now.getTimezoneOffset());
  // Get a diff of now versus the given time, but we assume negatives / in the future
  // shouldn't display with `-` signs everywhere. This should be safe because
  // in the context of most ui's this is probably what you want anyway.
  const diff = Math.abs((now - (unixTime * 1000)));

  return {
    years: parseInt(diff / YEARS),
    months: parseInt(diff % YEARS / MONTHS),
    days: parseInt(diff % MONTHS / DAYS),
    hours: parseInt((diff % DAYS) / HOURS),
    minutes: parseInt((diff % HOURS) / MINUTES),
  };
};

export const formatParts = (unixTime, format) => {
  const parts = [];
  const { years, months, days, hours, minutes } = differenceFromNow(unixTime);

  if (years !== 0 && format.years) {
    parts.push(`${years}${format.years}`);
  }

  if (months !== 0 && format.months) {
    parts.push(`${months}${format.months}`);
  }

  if (days !== 0 && format.days) {
    parts.push(`${days}${format.days}`);
  }

  if (hours !== 0 && format.hours) {
    parts.push(`${hours}h`);
  }

  if (days === 0 && hours === 0 && format.minutes) {
    parts.push(`${minutes}${format.minutes}`);
  }

  return parts;
};

export const short = unixTime => {
  // use short names for the parts, and only use the first part
  return formatParts(unixTime, {
    years: 'y',
    months: 'm',
    days: 'd',
    hours: 'h',
    minutes: 'm',
  }).slice(0, 1).join(', ');
};

export const long = unixTime => {
  return formatParts(unixTime, {
    years: ' years',
    months: ' months',
    days: ' days',
  }).join(', ');
};
