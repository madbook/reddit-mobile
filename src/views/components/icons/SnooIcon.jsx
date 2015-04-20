import React from 'react';
import MyMath from '../../../lib/danehansen/MyMath';
import DrawSVGPlugin from '../../../lib/greensock/plugins/DrawSVGPlugin.min.js';

import SVGFactory from '../../components/SVG';
var SVG;


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
          <path ref='face' className='SVG-fill-bg' d='M15.333333,11.499898c0-2.113655-2.392639-3.833231-5.333565-3.833231 c-2.940686,0-5.333102,1.719576-5.333102,3.833231c0,2.113753,2.392416,3.833435,5.333102,3.833435 C12.940694,15.333333,15.333333,13.613651,15.333333,11.499898z'/>
          <circle ref='dingleberry' className='SVG-fill-bg' cx='14.166199' cy='5' r='1'/>
          <g fill='none' className='SVG-stroke-bg' strokeWidth='0.466667' strokeLinecap='round'>
            <line ref='stem' x1='14.166667' y1='5.012208' x2='10.756104' y2='4.256104'/>
            <line ref='base' x1='10' y1='7.666667' x2='10.756104' y2='4.256104'/>
          </g>
          <circle ref='leftEar' className='SVG-fill-bg' cx='5.333431' cy='9.6668' r='1.3335'/>
          <circle ref='rightEar' className='SVG-fill-bg' cx='14.666443' cy='9.6668' r='1.3335'/>
          <circle ref='leftEye' className='SVG-fill' cx='7.8' cy='11' r='1'/>
          <circle ref='rightEye' className='SVG-fill' cx='12.2' cy='11' r='1'/>
          <rect ref='upperEyelids' x='6.8' y='10' className='SVG-fill-bg' width='6.4' height='0'/>
          <rect ref='lowerEyelids' x='6.8' y='12' className='SVG-fill-bg' width='6.4' height='0'/>
          <path ref='mouth' fill='none' className='SVG-stroke mouth' strokeWidth='0.5' strokeLinecap='round' d='M7.9,13.222941c0.533333,0.378255,1.272026,0.610392,2.066666,0.610392 c0.794641,0,1.533334-0.232137,2.066668-0.610392'/>
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
    TweenLite.to(this.refs.all.getDOMNode(), instant ? 0 : 0.4, {scale: bool ? 1.2 : 1, ease: Back.easeOut, transformOrigin: '50% 50%'});
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
      timeline.add(TweenLite.to([upper, lower], 0.1, {attr: {height: 1}, autoRound: false}));
      timeline.add(TweenLite.to(lower, 0.1, {attr: {y: 11}, autoRound: false}), 0);
      timeline.add(TweenLite.to([upper, lower], 0.1, {attr: {height: 0}, autoRound: false}));
      timeline.add(TweenLite.to(lower, 0.1, {attr: {y: 12}, autoRound: false}), 0.1);
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
