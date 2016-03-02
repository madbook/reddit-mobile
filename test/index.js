require('babel-polyfill');

require('babel-register')({
  ignore: false,
  only: /.+(?:(?:\.es6\.js)|(?:.jsx))$/,
  extensions: ['.js', '.es6.js', '.jsx' ],
  sourceMap: true,
  presets: [
    'es2015',
    'react',
  ],
  plugins: [
    'transform-object-rest-spread',
    'transform-async-to-generator',
    'transform-class-properties',
    'syntax-trailing-function-commas',
  ],
});

// lib
require('./lib/titleCase');
require('./lib/formatDifference');
require('./lib/formatNumber');
require('./lib/extractErrorMsg');
require('./lib/rootDomain');
require('./lib/gifToHTML5Sources');
require('./lib/isFakeSubreddit');

// src
require('./src/featureflags');

// Even with shallow rendering react currently looks for document when setState is used.
// see https://github.com/facebook/react/issues/4019
global.document = {};

// components
require('./views/components/Modal');


//Layouts
require('./views/layouts/BodyLayout');

// pages
require('./views/pages/Index');
require('./views/pages/userSaved');
require('./views/pages/wikipage');

// functions from routes
require('./routes/loginRegisterOriginalUrl.es6.js');
