import React from 'react';

import BaseComponent from '../../components/BaseComponent';
import SVG from '../../components/SVG';
import globals from '../../../globals';

const _POINTS = [
  {x: 5.833,  y: 5.233},
  {x: 8.852,  y: 5.940},
  {x: 12.773, y: 5.010},
  {x: 15.833, y: 5.702}
];
const _LEN = _POINTS.length;
const _X_DIFF = _POINTS[_LEN - 1].x - _POINTS[0].x;
const _START_Y = _POINTS[0].y;

class FlagIcon extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {};
    this._play = this._play.bind(this);
    this._maskID = 'mask' + globals().random();
  }

  render() {
    return (
      <SVG className='SVG-icon FlagIcon' fallbackIcon='icon-flag-circled'>
        <defs>
          <clipPath id={this._maskID}>
            <rect ref='mask' x={_POINTS[0].x} y='0' width={_X_DIFF} height={SVG.ICON_SIZE} fill='#000'/>
          </clipPath>
        </defs>
        <circle className='SVG-fill' cx={SVG.ICON_SIZE / 2} cy={SVG.ICON_SIZE / 2} r={SVG.ICON_SIZE / 2}/>
        <line className='SVG-stroke-bg' strokeWidth='0.7' strokeLinecap='round' x1='5' y1='5' x2='5' y2='15.8'/>
        <path ref='flag' className='SVG-fill-bg' clipPath={'url(#' + this._maskID + ')'} d='M10.8,5.5c-2.1,1.2-5-0.2-5-0.2s-3-1.4-5-0.2c-2.1,1.2-5-0.2-5-0.2v6.7c0,0,2.9,1.2,5,0.2c2.2-1,5,0.2,5,0.2s2.9,1.2,5,0.2 c2.2-1,5,0.2,5,0.2V5.7C15.8,5.7,12.9,4.3,10.8,5.5z'/>
      </SVG>
    );
  }

  componentDidMount() {
    if (!SVG.ENABLED) {
      return;
    }
    this.refs.flag.getDOMNode().setAttribute('clip-path', 'url(#' + this._maskID + ')');
  }

  componentDidUpdate(prevProps) {
    if (!SVG.ENABLED) {
      return;
    }
    var played = prevProps.played;
    if (typeof played !== 'undefined' && played !== this.props.played && this.props.played === true) {
      this._play();
    }
  }

  _timeline() {
    if (!this._tl) {
      var flag = this.refs.flag.getDOMNode();
      this._tl = new TimelineLite({paused: true, onComplete: this._play});
      var duration = 0.6;
      for (var i = 1; i < _LEN; i++) {
        var next = _POINTS[i];
        var d = (next.x - _POINTS[i - 1].x) / _X_DIFF * duration;
        if (i === 1) {
          var ease = Sine.easeOut;
        } else if (i === _LEN - 1) {
          ease = Sine.easeIn;
        } else {
          ease = Cubic.easeInOut;
        }
        this._tl.add(TweenLite.to(flag, d, {y: SVG.perc(next.y - _START_Y), ease: ease}));
      }
      this._tl.add(TweenLite.to(flag, duration, {x: SVG.perc(_X_DIFF), ease: Linear.easeNone}), 0);
      this._tl.add(TweenLite.to(this.refs.mask.getDOMNode(), duration, {attr: {x: _POINTS[0].x - _X_DIFF}, ease: Linear.easeNone}), 0);
    }
    return this._tl;
  }

  _play() {
    if (this.props.played && !this._timeline().isActive()) {
      this._timeline().play(0);
    }
  }
}

FlagIcon.defaultProps = {
  played: false,
};

export default FlagIcon;
