require('6to5/register')({
  ignoreRegex: /^(?!.*es6\.js?$).*\.js?$/i,
  extensions: ['.js', '.es6.js'],
});

require('./app/server');

