import React from 'react';
import SVGFactory from '../../components/SVG';
var SVG;
var _diag;
var _half;

class ShareIcon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this._play = this._play.bind(this);
    this._planeMaskID = 'mask' + props.random();
    this._lineMaskID = 'mask' + props.random();
  }

  render() {
    return (
      <SVG className='SVG-icon ShareIcon' fallbackIcon='icon-share-circled'>
        <defs>
          <clipPath id={this._planeMaskID}>
            <circle ref='planeMask' fill='#000' cx={_half} cy={_half} r={_half}/>
          </clipPath>
          <clipPath id={this._lineMaskID}>
            <circle fill='#000' cx={_half} cy={_half} r={_half}/>
          </clipPath>
        </defs>
        <circle className='SVG-fill' cx={SVG.ICON_SIZE / 2} cy={SVG.ICON_SIZE / 2} r={SVG.ICON_SIZE / 2}/>
        <g ref='plane' className='SVG-fill-bg' clipPath={'url(#' + this._planeMaskID + ')'}>
          <polygon points='2.928955,8.821472 7.92926,11.599365 15.151794,4.37677 '/>
          <polygon points='11.178528,17.070984 15.623169,4.848206 8.400574,12.07074 '/>
        </g>
        <g ref='lines' className='SVG-stroke-bg' strokeWidth='1' strokeDasharray='2,2' clipPath={'url(#' + this._lineMaskID + ')'}>
          <line ref='top' x1={_half} y1={_half} x2={_half} y2={_half} strokeDashoffset='0'/>
          <line ref='bottom' x1='0' y1={SVG.ICON_SIZE} x2='0' y2={SVG.ICON_SIZE} strokeDashoffset={_diag}/>
        </g>
      </SVG>
    );
  }

  componentDidMount() {
    if (!SVG.ENABLED) {
      return;
    }
    this.refs.plane.getDOMNode().setAttribute('clip-path', 'url(#' + this._planeMaskID + ')');
    this.refs.lines.getDOMNode().setAttribute('clip-path', 'url(#' + this._lineMaskID + ')');

    var dur = 0.3;
    var planeDelay = dur * 0.5;
    var trailDelay = dur * 1.0;
    var plane = this.refs.plane.getDOMNode();
    var top = this.refs.top.getDOMNode();
    var bottom = this.refs.bottom.getDOMNode();
    var planeMask = this.refs.planeMask.getDOMNode();

    var bottomTimeline = new TimelineLite({paused: true});
    bottomTimeline.add(TweenLite.fromTo(bottom, dur, {attr: {x2: 0, y2: SVG.ICON_SIZE}}, {ease: Linear.easeNone, attr: {x2: _half, y2: _half}}), 0);
    bottomTimeline.add(TweenLite.fromTo(bottom, dur, {attr: {x1: 0, y1: SVG.ICON_SIZE, 'stroke-dashoffset': _diag}}, {ease: Linear.easeNone, attr: {x1: _half, y1: _half, 'stroke-dashoffset': _diag * 2}}), trailDelay);

    this._timeline = new TimelineLite({paused: true, onComplete: this._play});
    this._timeline.add(TweenLite.fromTo(plane, dur, {x: 0, y: 0}, {x: _half, y: SVG.ICON_SIZE * -0.5, ease: Linear.easeNone}), 0);
    this._timeline.add(TweenLite.fromTo(planeMask, dur, {x: 0, y: 0}, {x: -_half, y: SVG.ICON_SIZE * 0.5, ease: Linear.easeNone}), 0);
    this._timeline.add(TweenLite.fromTo(top, dur, {attr: {x2: _half, y2: _half}}, {ease: Linear.easeNone, attr: {x2: SVG.ICON_SIZE, y2: 0}}), 0);
    this._timeline.add(TweenLite.fromTo(top, dur, {attr: {x1: _half, y1: _half, 'stroke-dashoffset': 0}}, {ease: Linear.easeNone, attr: {x1: SVG.ICON_SIZE, y1: 0, 'stroke-dashoffset': _diag}}), trailDelay);
    this._timeline.add(TweenLite.fromTo(plane, dur, {x: SVG.ICON_SIZE * -0.5, y: _half}, {x: 0, y: 0, ease: Linear.easeNone}), dur + planeDelay);
    this._timeline.add(TweenLite.fromTo(planeMask, dur, {x: SVG.ICON_SIZE * 0.5, y: -_half}, {x: 0, y: 0, ease: Linear.easeNone}), dur + planeDelay);
    this._timeline.call(bottomTimeline.play, [0], bottomTimeline, dur + planeDelay);
    this._timeline.progress(0.1);
    this._timeline.progress(0.0);
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

  _play() {
    if (this.props.played && !this._timeline.isActive()) {
      this._timeline.play(0);
    }
  }
}

ShareIcon.defaultProps = {
  played: false,
};

function ShareIconFactory(app) {
  SVG = SVGFactory(app);
  _diag = Math.sqrt(Math.pow(SVG.ICON_SIZE, 2) * 2) * 0.5;
  _half = SVG.ICON_SIZE * 0.5;
  return app.mutate('core/components/icons/ShareIcon', ShareIcon);
}

export default ShareIconFactory;
