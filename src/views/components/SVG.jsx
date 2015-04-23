import React from 'react';
import Utils from '../../lib/danehansen/Utils';

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
      var move = this.props.move;
      var out = this.props.out;
      return (
        <svg className={this.props.className} version='1.1' xmlns={_NS} x='0px' y='0px' width={width+'px'} height={height+'px'} viewBox={'0 0 '+width+' '+height} onMouseMove={this._touch ? null : move}
          onTouchMove={this._touch ? move : null} onMouseLeave={this._touch ? null : out} onTouchEnd={this._touch ? out : null}>
          {this.props.children}
        </svg>
      );
    } else {
      var fallbackIcon = this.props.fallbackIcon;
      if (fallbackIcon) {
        return <span className={fallbackIcon}/>;
      }
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
      return <span className='placeholder'/>;
    }
  }

  componentDidMount() {
    this._touch = Utils.touch();
  }
}

SVG.ENABLED = ((typeof document === 'undefined') || (!!document.createElementNS && !!document.createElementNS(_NS, 'svg').createSVGRect));
SVG.ICON_SIZE = 20;

SVG.perc = function(num) {
  return num / SVG.ICON_SIZE * 100 + '%';
};

function SVGFactory(app) {
  return app.mutate('core/components/SVG', SVG);
}

export default SVGFactory;
