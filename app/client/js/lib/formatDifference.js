var moment = require('moment');

function short(date) {
  var shortString = '';
  var now = moment();
  date = moment(date);

  var days = now.diff(date, 'days');
  var hours = now.diff(date, 'hours');
  var minutes = now.diff(date, 'minutes');

  if (days > 0) {
    shortString += days + 'd';
  }

  if (hours > 0) {
    shortString += hours + 'h';
  }

  if (days === 0 && hours === 0) {
    shortString += minutes + 'm';
  }

  return shortString;
}


module.exports = {
  short: short
};
