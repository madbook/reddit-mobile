var $ = global.$ = global.jQuery = require('jquery');

require('bootstrap');
require('embedly');

$(document).off('.collapse.data-api')

var Collapse = require('./components/collapse');
Collapse.bind('[data-toggle=collapse]');

var Vote = require('./components/vote');
Vote.bind('[data-vote]');

$.getJSON('/vars', function(data) {
  window.bootstrap = data;
});
