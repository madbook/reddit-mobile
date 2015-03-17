import React from 'react';

class SVG extends React.Component {
  constructor(props) {
    super(props);
    this.state={};
  }

  render () {
    var width = this.props.width;
    var height = this.props.height;
    return (
      <svg version='1.1' xmlns='http://www.w3.org/2000/svg' x='0px' y='0px' width={width+'px'} height={height+'px'} viewBox={'0 0 '+width+' '+height}>
        {this.props.children}
      </svg>
    );
  }
}

function SVGFactory(app) {
  return app.mutate('core/components/SVG', SVG);
}

export default SVGFactory;