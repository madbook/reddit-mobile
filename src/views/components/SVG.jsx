import React from 'react';

const _NS = 'http://www.w3.org/2000/svg';

class SVG extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    if (SVG.ENABLED) {
      var width = this.props.width;
      var height = this.props.height;
      return (
        <svg className={this.props.className} version='1.1' xmlns={_NS} x='0px' y='0px' width={width+'px'} height={height+'px'} viewBox={'0 0 '+width+' '+height}>
          {this.props.children}
        </svg>
      );
    } else {
      var fallbackText = this.props.fallbackText;
      if (fallbackText) {
        return <span className='fallbackText'>{fallbackText}</span>;
      }
      var fallbackImg = this.props.fallbackImg;
      if (fallbackImg) {
        return <img className='fallbackImg' src={fallbackImg} width={width} height={height}/>;
      }
      var Fallback = this.props.fallbackComponent;
      if (Fallback) {
        return <Fallback/>;
      }
      return <span className='fallbackText'>PLACEHOLDER</span>;
    }
  }
}

SVG.ENABLED = ((typeof document === 'undefined') || (!!document.createElementNS && !!document.createElementNS(_NS, 'svg').createSVGRect));

function SVGFactory(app) {
  return app.mutate('core/components/SVG', SVG);
}

export default SVGFactory;
