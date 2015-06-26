import React from 'react';
import MyMath from '../../../lib/danehansen/utils/MyMath';
import Point from '../../../lib/danehansen/geom/Point';
import DrawSVGPlugin from '../../../lib/greensock/plugins/DrawSVGPlugin.min.js';

import SVG from '../../components/SVG';

const _EYE_RADIUS = 1.142124;
const _EYE_HEIGHT = 11.1461885;
const _MOUTH_STROKE = 0.55;
const _DINGLEBERRY_CENTER = {x: 14.753913, y: 4.293349};
const _ELBOW = {x: 10.859162, y: 3.443727};
const _ROOT = {x: 9.995599, y: 7.339012};
const _REPEL_RADIUS = 10;
const _REPEL_FORCE = -0.05;
const _RETURN_FORCE = 0.05;
const _LEFT_EYE_X = 7.482927;
const _RIGHT_EYE_X = 12.508015;
const _EAR_HEIGHT = 9.6234565;
const _EAR_RADIUS = 1.523042;

class SnooIcon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this._play = this._play.bind(this);
    this.tweenOn = this.tweenOn.bind(this);
    this.tweenOff = this.tweenOff.bind(this);
    this._blink = this._blink.bind(this);
    this._blinkTimeout = this._blinkTimeout.bind(this);
    this.startBlinking = this.startBlinking.bind(this);
    this._blinkable = false;
    this._mounted = true;

    this._onMouseLeave = this._onMouseLeave.bind(this);
    this._onMove = this._onMove.bind(this);
    this._onTick = this._onTick.bind(this);
    this._mouse = {};
    this._dingleberryCenter = {x: _DINGLEBERRY_CENTER.x, y: _DINGLEBERRY_CENTER.y};
    this._baseLength = Point.distance(_ROOT, _ELBOW);
    this._endLength = Point.distance(_DINGLEBERRY_CENTER, _ELBOW);
    this._ticking = false;
    this._scale = 1;
  }

  render() {
    return (
      <SVG className='SVG-icon SnooIcon' fallbackIcon='icon-snoo-circled' move={this.props.played ? this._onMove : null} out={this._onMouseLeave}>
        <circle className='SVG-fill' cx={SVG.ICON_SIZE / 2} cy={SVG.ICON_SIZE / 2} r={SVG.ICON_SIZE / 2}/>
        <g ref='all'>
          <path ref='face' className='SVG-fill-bg' d='M16.086926,11.717036c0-2.414056-2.732691-4.378024-6.091592-4.378024 c-3.358627,0-6.091061,1.963968-6.091061,4.378024c0,2.414167,2.732434,4.378257,6.091061,4.378257 C13.354235,16.095293,16.086926,14.131204,16.086926,11.717036z'/>
          <circle ref='dingleberry' className='SVG-fill-bg' cx={_DINGLEBERRY_CENTER.x} cy={_DINGLEBERRY_CENTER.y} r={_EYE_RADIUS}/>
          <g fill='none' className='SVG-stroke-bg' strokeWidth='0.532991' strokeLinecap='round'>
            <line ref='stem' x1={_ELBOW.x} y1={_ELBOW.y} x2={_DINGLEBERRY_CENTER.x} y2={_DINGLEBERRY_CENTER.y}/>
            <line ref='base' x1={_ELBOW.x} y1={_ELBOW.y} x2={_ROOT.x} y2={_ROOT.y}/>
          </g>
          <circle ref='leftEar' className='SVG-fill-bg' cx='4.6658' cy={_EAR_HEIGHT} r={_EAR_RADIUS}/>
          <circle ref='rightEar' className='SVG-fill-bg' cx='15.325253' cy={_EAR_HEIGHT} r={_EAR_RADIUS}/>
          <circle ref='leftEye' className='SVG-fill' cx={_LEFT_EYE_X} cy={_EYE_HEIGHT} r={_EYE_RADIUS}/>
          <circle ref='rightEye' className='SVG-fill' cx={_RIGHT_EYE_X} cy={_EYE_HEIGHT} r={_EYE_RADIUS}/>
          <rect ref='upperEyelids' x={_LEFT_EYE_X - _EYE_RADIUS} y={_EYE_HEIGHT - _EYE_RADIUS} className='SVG-fill-bg' width={_RIGHT_EYE_X - _LEFT_EYE_X + _EYE_RADIUS * 2} height='0'/>
          <rect ref='lowerEyelids' x={_LEFT_EYE_X - _EYE_RADIUS} y={_EYE_HEIGHT + _EYE_RADIUS} className='SVG-fill-bg' width={_RIGHT_EYE_X - _LEFT_EYE_X + _EYE_RADIUS * 2} height='0'/>
          <path ref='mouth' fill='none' className='SVG-stroke' strokeWidth={_MOUTH_STROKE} strokeLinecap='round' d='M7.652076,13.657867c0.460886,0.460942,1.363549,0.705836,2.347492,0.705836 c1.016057,0,1.886656-0.244787,2.348355-0.705836'/>
        </g>
      </SVG>
    );
  }

  componentDidMount() {
    var svg = React.findDOMNode(this);
    this._scale = Math.min(svg.offsetWidth, svg.offsetHeight) / SVG.ICON_SIZE;
  }

  componentWillReceiveProps(nextProps) {
    if (!SVG.ENABLED) {
      return;
    }
    var played = nextProps.played;
    if (typeof played !== 'undefined' && played !== this.props.played) {
      this._play(played);
    }
  }

  componentWillUnmount() {
    clearTimeout(this._timeout);
    this._blinkable = false;
    this._mounted = false;
  }

  _play(bool) {
    if(bool) {
      TweenLite.to(this.refs.mouth.getDOMNode(), 0.1, {attr: {'stroke-width': _MOUTH_STROKE * 2.5}, ease: Linear.easeNone});
      this.startBlinking();
    } else {
      this._blinkable = false;
      TweenLite.to(this.refs.mouth.getDOMNode(), 0.1, {attr: {'stroke-width': _MOUTH_STROKE}, ease: Linear.easeNone});
    }
  }

  _onMove(evt) {
    this._mouse = Point.relativePosition(evt.nativeEvent, React.findDOMNode(this));
    this._mouse.x /= this._scale;
    this._mouse.y /= this._scale;
    if (!this._ticking) {
      this._ticking = true;
      TweenLite.ticker.addEventListener('tick', this._onTick);
    }
  }

  _onMouseLeave() {
    this._mouse.x = Number.MAX_VALUE;
    this._mouse.y = Number.MAX_VALUE;
  }

  _onTick() {
    //find distance
    var xDist = Math.abs(this._dingleberryCenter.x-this._mouse.x);
    var yDist = Math.abs(this._dingleberryCenter.y-this._mouse.y);
    var dist = Math.sqrt(Math.pow(xDist, 2)+Math.pow(yDist, 2));
    //repel mouse if close enough
    if (dist < _REPEL_RADIUS) {
      var totalDist = xDist + yDist;
      var force = (_REPEL_RADIUS - dist) / _REPEL_RADIUS * _REPEL_FORCE;
      MyMath.velocityEase(this._dingleberryCenter, 'x', this._mouse.x, xDist / totalDist * force);
      MyMath.velocityEase(this._dingleberryCenter, 'y', this._mouse.y, yDist / totalDist * force);
    }
    //return to centerpoint
    var diff = MyMath.velocityEase(this._dingleberryCenter, 'x', _DINGLEBERRY_CENTER.x, _RETURN_FORCE);
    diff += MyMath.velocityEase(this._dingleberryCenter, 'y', _DINGLEBERRY_CENTER.y, _RETURN_FORCE);
    if (Math.abs(diff) < 0.01 && Point.distance(_DINGLEBERRY_CENTER, this._dingleberryCenter) < 0.01) {
      this._ticking = false;
      TweenLite.ticker.removeEventListener('tick', this._onTick);
    }
    //set dingleberry to new position
    var dingleberry = this.refs.dingleberry.getDOMNode();
    dingleberry.setAttribute('cx', this._dingleberryCenter.x);
    dingleberry.setAttribute('cy', this._dingleberryCenter.y);
    //set stem end tip to new position
    var stem = this.refs.stem.getDOMNode();
    stem.setAttribute('x2', this._dingleberryCenter.x);
    stem.setAttribute('y2', this._dingleberryCenter.y);
    //find potential elbow points
    var pot = MyMath.circleIntersection(this._dingleberryCenter, this._endLength, _ROOT, this._baseLength);
    if (pot) {
      //choose which one is closest to original elbow
      var dist1 = Point.distance(pot[0], _ELBOW);
      var dist2 = Point.distance(pot[1], _ELBOW);
      var elbow = dist1 > dist2 ? pot[1] : pot[0];
    } else {
      elbow = Point.interpolate(this._dingleberryCenter, _ROOT, 0.5);
    }
    //set elbow position
    stem.setAttribute('x1', elbow.x);
    stem.setAttribute('y1', elbow.y);
    var base = this.refs.base.getDOMNode();
    base.setAttribute('x1', elbow.x);
    base.setAttribute('y1', elbow.y);
  }

  startBlinking() {
    if (this._mounted) {
      this._blinkable = true;
      this._blink();
    }
  }

  _blink() {
    if (this._blinkable && this._mounted) {
      var upper = this.refs.upperEyelids.getDOMNode();
      var lower = this.refs.lowerEyelids.getDOMNode();
      var timeline = new TimelineLite({onComplete: this._blinkTimeout});
      timeline.add(TweenLite.to([upper, lower], 0.1, {attr: {height: _EYE_RADIUS}, autoRound: false}));
      timeline.add(TweenLite.to(lower, 0.1, {attr: {y: _EYE_HEIGHT}, autoRound: false}), 0);
      timeline.add(TweenLite.to([upper, lower], 0.1, {attr: {height: 0}, autoRound: false}));
      timeline.add(TweenLite.to(lower, 0.1, {attr: {y: _EYE_HEIGHT + _EYE_RADIUS}, autoRound: false}), 0.1);
    }
  }

  _blinkTimeout() {
    if (this._blinkable && this._mounted) {
      this._timeout = setTimeout(this._blink, Math.random() * 1000);
    }
  }

  tweenOn(callback) {
    if (SVG.ENABLED) {
      var BACK_BASE = 1.70158;
      var refs = this.refs;
      var nodes = [refs.rightEye, refs.leftEye, refs.rightEar, refs.leftEar];
      var timeline = new TimelineLite({onComplete:callback});
      timeline.add(TweenLite.from(this.refs.face.getDOMNode(), 0.3, {transformOrigin:'50% 50%', scale:0}));
      var dur = timeline.duration();
      for (var i = 0, iLen = nodes.length; i < iLen; i++) {
        var overshoot = MyMath.random(2);
        timeline.add(TweenLite.from(nodes[i].getDOMNode(), (BACK_BASE + overshoot) * 0.2, {scale: 0, transformOrigin: '50% 50%', ease: Back.easeOut.config(BACK_BASE + overshoot)}), 0.15 + MyMath.random(0.4));
        if (i === 1) {
          timeline.call(this.startBlinking, null, this, timeline.duration());
        }
      }
      var base = refs.base.getDOMNode();
      var stem = refs.stem.getDOMNode();
      timeline.add(TweenLite.from(base, 0.001, {strokeWidth: 0, autoRound: false}), dur);
      timeline.add(TweenLite.from(base, 0.2, {attr: {x1: _ROOT.x, y1: _ROOT.y}, ease: Cubic.easeIn}), dur);
      dur += 0.2;
      timeline.add(TweenLite.from(stem, 0.001, {strokeWidth: 0, autoRound: false}), dur);
      timeline.add(TweenLite.from(stem, 0.2, {attr: {x2: _ELBOW.x, y2: _ELBOW.y}, ease: Cubic.easeOut}), dur);
      dur += 0.2;
      timeline.add(TweenLite.from(refs.dingleberry.getDOMNode(), 0.7, {transformOrigin: '50% 50%', scale: 0, ease: Back.easeOut.config(5)}), dur);
      timeline.add(TweenLite.from(refs.mouth.getDOMNode(), 0.2, {drawSVG: 0, ease: Cubic.easeInOut}), dur);
    }
  }

  tweenOff(callback) {
    if (SVG.ENABLED) {
      this._blinkable = false;
      var refs = this.refs;
      var nodes = [refs.face, refs.rightEar, refs.leftEar, refs.rightEye, refs.leftEye, refs.dingleberry];
      var timeline = new TimelineLite({onComplete: callback});
      var lower = refs.lowerEyelids.getDOMNode();
      timeline.add(TweenLite.to([refs.upperEyelids.getDOMNode(), lower], 0, {attr: {height: 0}}));
      timeline.add(TweenLite.to(lower, 0, {attr: {y: 12}}));
      timeline.add(TweenLite.to(this.refs.stem.getDOMNode(), 0.15, {attr: {x2: _ELBOW.x, y2: _ELBOW.y}, ease: Cubic.easeIn}), 0);
      timeline.add(TweenLite.to(this.refs.stem.getDOMNode(), 0.001, {strokeWidth: 0, autoRound: false}));
      timeline.add(TweenLite.to(this.refs.base.getDOMNode(), 0.15, {attr: {x1: _ROOT.x, y1: _ROOT.y}, transformOrigin: '50% 50%', ease: Cubic.easeOut}));
      timeline.add(TweenLite.to(this.refs.base.getDOMNode(), 0.001, {strokeWidth: 0, autoRound: false}));

      for (var i = 0, iLen = nodes.length; i < iLen; i++) {
        timeline.add(TweenLite.to(nodes[i].getDOMNode(), 0.3, {scale: 0, transformOrigin: '50% 50%', ease: Cubic.easeOut}), 0);
      }
      timeline.add(TweenLite.to(this.refs.mouth.getDOMNode(), 0.2, {drawSVG: 0, ease: Cubic.easeInOut}), 0);
    }
  }
}

SnooIcon.defaultProps = {
  played: false,
};

export default SnooIcon;
