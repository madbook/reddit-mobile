import React from 'react';
import MyMath from '../../../lib/danehansen/MyMath';
import DrawSVGPlugin from '../../../lib/greensock/plugins/DrawSVGPlugin.min.js';

import SVGFactory from '../../components/SVG';
var SVG;
var _EYE_RADIUS = 1.142124;
var _EYE_HEIGHT = 11.1461885;

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
  }

  render() {
    return (
      <SVG className='SVG-icon SnooIcon' width={SVG.ICON_SIZE} height={SVG.ICON_SIZE} fallbackIcon='icon-snoo-circled'>
        <circle className='SVG-fill' cx='10' cy='10' r='10'/>
        <g ref='all'>
          <path ref='face' className='SVG-fill-bg' d='M16.086926,11.717036c0-2.414056-2.732691-4.378024-6.091592-4.378024 c-3.358627,0-6.091061,1.963968-6.091061,4.378024c0,2.414167,2.732434,4.378257,6.091061,4.378257 C13.354235,16.095293,16.086926,14.131204,16.086926,11.717036z'/>
          <circle ref='dingleberry' className='SVG-fill-bg' cx='14.753913' cy='4.293349' r={_EYE_RADIUS}/>
          <g fill='none' className='SVG-stroke-bg' strokeWidth='0.532991' strokeLinecap='round'>
            <line ref='stem' x1='10.859162' y1='3.443727' x2='14.754447' y2='4.307292'/>
            <line ref='base' x1='10.859162' y1='3.443727' x2='9.995599' y2='7.339012'/>
          </g>
          <circle ref='leftEar' className='SVG-fill-bg' cx='4.6658' cy='9.6234565' r='1.523042'/>
          <circle ref='rightEar' className='SVG-fill-bg' cx='15.325253' cy='9.6234565' r='1.523042'/>
          <circle ref='leftEye' className='SVG-fill' cx='7.482927' cy={_EYE_HEIGHT} r={_EYE_RADIUS}/>
          <circle ref='rightEye' className='SVG-fill' cx='12.508015' cy={_EYE_HEIGHT} r={_EYE_RADIUS}/>
          <rect ref='upperEyelids' x='6.340803' y='10.004064' className='SVG-fill-bg' width='7.309336' height='0'/>
          <rect ref='lowerEyelids' x='6.340803' y='12.288315' className='SVG-fill-bg' width='7.309336' height='0'/>
          <path ref='mouth' fill='none' className='SVG-stroke mouth' strokeWidth='0.55' strokeLinecap='round' d='M7.652076,13.657867c0.460886,0.460942,1.363549,0.705836,2.347492,0.705836 c1.016057,0,1.886656-0.244787,2.348355-0.705836'/>
        </g>
      </SVG>
    );
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

  _play(bool, instant) {
    // TweenLite.to(this.refs.all.getDOMNode(), instant ? 0 : 0.4, {scale: bool ? 1.2 : 1, ease: Back.easeOut, transformOrigin: '50% 50%'});
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
    timeline.add(TweenLite.from(base, 0.2, {attr: {x2 :10, y2: 7.666667}, ease: Cubic.easeIn}), dur);
    dur += 0.2;
    timeline.add(TweenLite.from(stem, 0.001, {strokeWidth: 0, autoRound: false}), dur);
    timeline.add(TweenLite.from(stem, 0.2, {attr: {x1: 10.756104, y1: 4.256104}, ease: Cubic.easeOut}), dur);
    dur += 0.2;
    timeline.add(TweenLite.from(refs.dingleberry.getDOMNode(), 0.7, {transformOrigin: '50% 50%', scale: 0, ease: Back.easeOut.config(5)}), dur);
    timeline.add(TweenLite.from(refs.mouth.getDOMNode(), 0.2, {drawSVG: 0, ease: Cubic.easeInOut}), dur);
  }

  tweenOff(callback) {
    this._blinkable = false;
    var refs = this.refs;
    var nodes = [refs.face, refs.rightEar, refs.leftEar, refs.rightEye, refs.leftEye, refs.dingleberry];
    var timeline = new TimelineLite({onComplete: callback});
    var lower = refs.lowerEyelids.getDOMNode();
    timeline.add(TweenLite.to([refs.upperEyelids.getDOMNode(), lower], 0, {attr: {height: 0}}));
    timeline.add(TweenLite.to(lower, 0, {attr: {y: 12}}));
    timeline.add(TweenLite.to(this.refs.stem.getDOMNode(), 0.15, {attr: {x1:10.756104, y1: 4.256104}, ease: Cubic.easeIn}), 0);
    timeline.add(TweenLite.to(this.refs.stem.getDOMNode(), 0.001, {strokeWidth: 0, autoRound: false}));
    timeline.add(TweenLite.to(this.refs.base.getDOMNode(), 0.15, {attr: {x2: 10, y2: 7.666667}, transformOrigin: '50% 50%', ease: Cubic.easeOut}));
    timeline.add(TweenLite.to(this.refs.base.getDOMNode(), 0.001, {strokeWidth: 0, autoRound: false}));

    for (var i = 0, iLen = nodes.length; i < iLen; i++) {
      timeline.add(TweenLite.to(nodes[i].getDOMNode(), 0.3, {scale: 0, transformOrigin: '50% 50%', ease: Cubic.easeOut}), 0);
    }
    timeline.add(TweenLite.to(this.refs.mouth.getDOMNode(), 0.2, {drawSVG: 0, ease: Cubic.easeInOut}), 0);
  }
}

SnooIcon.defaultProps = {
  played: false,
};

function SnooIconFactory(app) {
  SVG = SVGFactory(app);
  return app.mutate('core/components/icons/SnooIcon', SnooIcon);
}

export default SnooIconFactory;
