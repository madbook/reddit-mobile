var React = require('react');

var MainSection = require('./components/MainSection.react.jsx');

var render = function(){
  React.renderComponent(
    <MainSection />,
    document.getElementById('content')
  );
};

render();
