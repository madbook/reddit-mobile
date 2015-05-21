import React from 'react';
import Utils from '../../lib/danehansen/utils/Utils';
import constants from '../../constants';

const _NS = 'http://www.w3.org/2000/svg';

class SVG extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      touch: false,
    };
  }

  render() {
    if (SVG.ENABLED) {
      var width = this.props.width || SVG.ICON_SIZE;
      var height = this.props.height || SVG.ICON_SIZE;
      var move = this.props.move;
      var out = this.props.out;
      return (
        <svg className={this.props.className} version='1.1' xmlns={_NS} x='0px' y='0px' width={width+'px'} height={height+'px'} viewBox={'0 0 '+width+' '+height} onMouseMove={this.state.touch ? null : move}
          onTouchMove={this.state.touch ? move : null} onMouseLeave={this.state.touch ? null : out} onTouchEnd={this.state.touch ? out : null}>
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

  componentDidMount() {
    this.setState({touch: Utils.touch()});
  }
}

SVG.ENABLED = typeof document !== 'undefined' && (!!document.createElementNS && !!document.createElementNS(_NS, 'svg').createSVGRect);
SVG.ICON_SIZE = 20;

SVG.perc = function(num) {
  return num / SVG.ICON_SIZE * 100 + '%';
};

export default SVG;
