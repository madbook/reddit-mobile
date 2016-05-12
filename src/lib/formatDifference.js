const SECONDS = 1000;
const MINUTES = 60 * SECONDS;
const HOURS = 60 * MINUTES;
const DAYS = 24 * HOURS;

function short(date) {
  let shortString = '';
  const now = new Date();
  now.setMinutes(now.getMinutes(), -1 * now.getTimezoneOffset());

  const diff = (now - date);

  const days = parseInt(diff / DAYS);
  const hours = parseInt((diff % DAYS) / HOURS);
  const minutes = parseInt((diff % HOURS) / MINUTES);

  if (days !== 0) {
    shortString += `${days}d`;
  }

  if (hours !== 0) {
    if (shortString) {
      shortString += ', ';
    }

    shortString += `${hours}h`;
  }

  if (days === 0 && hours === 0) {
    shortString += `${minutes}m`;
  }

  return shortString;
}

export default short;
