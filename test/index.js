require('babel/register')({
    extensions: ['.js', '.es6.js', '.jsx'],
});

// lib
require('./lib/titleCase');
require('./lib/formatDifference');

// Even with shallow rendering react currently looks for document when setState is used.
// see https://github.com/facebook/react/issues/4019
global.document = {};

// components
require('./views/components/Modal.jsx');


//Layouts
require('./views/layouts/BodyLayout.jsx');
