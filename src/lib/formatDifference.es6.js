import moment from 'moment';

function short(date) {
  let shortString = '';
  const now = moment();

  date = moment(date);

  const days = now.diff(date, 'days');
  const hours = now.diff(date, 'hours') - (days * 24);
  const minutes = now.diff(date, 'minutes') - (hours * 24);

  if (days > 0) {
    shortString += `${days}d`;
  }

  if (hours > 0) {
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
