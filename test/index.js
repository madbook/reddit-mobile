require('babel/register')({
    extensions: ['.js', '.es6.js', '.jsx'],
});

// require testing modules here.

// lib
require('./lib/titleCase');
require('./lib/formatDifference');


// set up jsdom
var jsdom = require('jsdom').jsdom;

global.document = jsdom('<!doctype html><html><body></body></html>');
global.window = global.document.defaultView;
global.navigator = {
  userAgent: 'node.js'
}

// components
require('./views/components/Modal.jsx');
