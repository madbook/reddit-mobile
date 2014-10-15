var $ = global.$ = global.jQuery = require('jquery');

var snoode = global.snoode = require('snoode');

require('bootstrap');
require('embedly');

$(document).off('.collapse.data-api')

var Collapse = require('./components/collapse');
Collapse.bind('[data-toggle=collapse]');

var Vote = require('./components/vote');
Vote.bind('[data-vote]');

var CommentTree = require('./components/commentTree');
CommentTree.bind('[data-action=moreComments]');

$.getJSON('/vars', function(data) {
  window.bootstrap = data;
});

/* Embedly platform script include */
(function(w, d){
  var id='embedly-platform', n = 'script';
  if (!d.getElementById(id)){
    w.embedly = w.embedly || function() {(w.embedly.q = w.embedly.q || []).push(arguments);};
    var e = d.createElement(n); e.id = id; e.async=1;
    e.src = ('https:' === document.location.protocol ? 'https' : 'http') + '://cdn.embedly.com/widgets/platform.js';
    var s = d.getElementsByTagName(n)[0];
    s.parentNode.insertBefore(e, s);
  }
})(window, document);
