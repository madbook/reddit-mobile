import React from 'react';
import constants from '../../constants';
import globals from '../../globals';
import BaseComponent from './BaseComponent';

const _NS = 'http://www.w3.org/2000/svg';

class SVG extends BaseComponent {
  constructor(props) {
    super(props);
  }

  render() {
    if (SVG.ENABLED) {
      var width = this.props.width || SVG.ICON_SIZE;
      var height = this.props.height || SVG.ICON_SIZE;
      var move = this.props.move;
      var out = this.props.out;
      return (
        <svg className={this.props.className} version='1.1' xmlns={_NS} x='0px' y='0px' width={width+'px'} height={height+'px'} viewBox={'0 0 '+width+' '+height} onMouseMove={globals().touch ? null : move}
          onTouchMove={globals().touch ? move : null} onMouseLeave={globals().touch ? null : out} onTouchEnd={globals().touch ? out : null}>
          {this.props.children}
        </svg>
      );
    } else {
      var fallbackIcon = this.props.fallbackIcon;
      if (fallbackIcon) {
        return <figure className={this.props.className + ' ' + fallbackIcon}/>;
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
}

SVG.ENABLED = typeof document !== 'undefined' && (!!document.createElementNS && !!document.createElementNS(_NS, 'svg').createSVGRect);
SVG.ICON_SIZE = 20;

SVG.perc = function(num) {
  return num / SVG.ICON_SIZE * 100 + '%';
};

SVG.propTypes = {
  className: React.PropTypes.string,
  fallbackIcon: React.PropTypes.string,
  fallbackText: React.PropTypes.string,
  fallbackImg: React.PropTypes.string,
  fallbackComponent: React.PropTypes.element,
  height: React.PropTypes.number,
  move: React.PropTypes.func,
  out: React.PropTypes.func,
  width: React.PropTypes.number,
};

export default SVG;
