// Note: the goal of this file is to provide date formatters in a "timeago" fashion.
// that is, for posts / comments we want to be denote it being "23d" ago or "1y" ago.
// and in some cases we want to have a longer, more formal representation of that. like
// "1 year, 2 months". This used to use Moment.js to do the heavy lifting but
// that was removed because of its negative impact on payload size. Now that
// we have this alternative there are other problems like testability --
// by ignoring some "corner" cases this approach is inherently not very testable, specifically `long`,
// has a little bit of drift right now (on the scale of days), so for now tests are excluded.
// Moment.js is itself written as a es6 module and exports a "jsnext:main"  field ala
// rollup's package management system. I think instead of solidifying this implmentation we
// should investigate supporting jsnext:main packages in node-build so we have to write less
// utility code like this ourselves.

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
    years: Math.floor(diff / YEARS),
    months: Math.floor(diff % YEARS / MONTHS),
    days: Math.floor(diff % MONTHS / DAYS),
    hours: Math.floor((diff % DAYS) / HOURS),
    minutes: Math.floor((diff % HOURS) / MINUTES),
  };
};

// given a unixTimestap, and a set of format rules, return an array of of the formatted parts
// that are returned from `differenceFromNow`
export const formatPartsFromNow = (unixTime, format) => {
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

// return a shorthand string describing the differnece between now and then given unix timesamp
// shorthand means that instead of "year", we'd return "y", and instead of 'day', we'd return 'd'.
// we also want it to be concise so we'll only use the first unit of time (see above) that describes
// the difference. (.e.g. 2months, 3weeks, and 1day ago will be formatted as '2m')
export const short = unixTime => {
  // use short names for the parts, and only use the first part
  return formatPartsFromNow(unixTime, {
    years: 'y',
    months: 'm',
    days: 'd',
    hours: 'h',
    minutes: 'm',
  }).slice(0, 1).join(', ');
};

// return a string describing the difference between now and the given unix timestamp.
// `long` is in contrast to `short` that's above, it will return the full name for units of time.
// however it only cares about 'years', 'months', and 'days'. So a date thats:
//  3years, 4months, 5days, 6minutes ago will be foramtted as '3 years, 4 months, 5 days';
export const long = unixTime => {
  return formatPartsFromNow(unixTime, {
    years: ' years',
    months: ' months',
    days: ' days',
  }).join(', ');
};
