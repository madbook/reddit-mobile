import * as moment from 'moment';

function short(date) {
  var shortString = '';
  var now = moment();
  date = moment(date);

  var days = now.diff(date, 'days');
  var hours = now.diff(date, 'hours') - (days * 24);
  var minutes = now.diff(date, 'minutes') - (hours * 24);

  if (days > 0) {
    shortString += days + 'd';
  }

  if (hours > 0) {
    if (shortString) {
      shortString += ', ';
    }

    shortString += hours + 'h';
  }

  if (days === 0 && hours === 0) {
    shortString += minutes + 'm';
  }

  return shortString;
}

export { short };

module.exports = {
  short: short
};
