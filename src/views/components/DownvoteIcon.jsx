import React from 'react';
import SVGFactory from '../components/SVG';
var SVG;
import MyMath from '../../lib/danehansen/MyMath';

class DownvoteIcon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this._alter = this._alter.bind(this);
    this._play = this._play.bind(this);
    this._maskID = 'mask' + Math.random();
  }

  render() {
    return (
      <SVG className={'DownvoteIcon' + (this.props.altered ? ' altered' : '')} width={16} height={16} fallbackText='downvote'>
        <defs>
          <clipPath id={this._maskID}>
            <circle ref='mask' fill='#000' cx='8' cy='8' r='8'/>
          </clipPath>
        </defs>
        <circle className='tween SVG-fill' cx='8' cy='8' r='8'/>
        <svg ref='arrows' className='SVG-fill-bg' y='-2' x='-2' clip-path={'url(#' + this._maskID + ')'}>
          <path ref='arrow1' d='M10.052799,15.833334h0.000041l5.36036-5.825782c-0.002268-0.005168-0.001045-0.002383-0.003313-0.007551 h-3.321362c-0.000668-0.000668-0.001041-0.001042-0.001709-0.001709V5H7.92015v4.99648 c-0.001369,0.001369-0.002151,0.002151-0.00352,0.00352H4.586799L10.052799,15.833334z'/>
          <path ref='arrow2' d='M10.052799-4.166666h0.000041l5.36036-5.825782c-0.002268-0.005168-0.001045-0.002383-0.003313-0.007551 h-3.321362c-0.000668-0.000668-0.001041-0.001042-0.001709-0.001709v-4.998291H7.92015v4.99648 c-0.001369,0.001369-0.002151,0.002151-0.00352,0.00352H4.586799L10.052799-4.166666z'/>
        </svg>
      </SVG>
    );
  }

  componentDidMount() {
    if (!SVG.ENABLED) {
      return;
    }
    this.refs.arrows.getDOMNode().setAttribute('clip-path', 'url(#' + this._maskID + ')');
    if (this.props.played) {
      this._play(true, true);
    }
    if (this.props.altered) {
      this._alter(true, true);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!SVG.ENABLED) {
      return;
    }
    var altered = nextProps.altered;
    if (typeof altered !== 'undefined' && altered !== this.props.altered) {
      this._alter(altered);
    }
    var played = nextProps.played;
    if (typeof played !== 'undefined' && played !== this.props.played) {
      this._play(played);
    }
  }

  _alter(bool, instant) {
    if (instant) {
      var t = 0;
      var delay = 0;
      var ease = Linear.easeNone;
    } else {
      ease = Back.easeOut.config(rand);
      var rand = MyMath.random(1, 4);
      t = 0.3 + (rand - 1) / 3 * 0.3;
      delay = Math.random() * 0.1;
    }
    if (bool) {
      TweenLite.to(this.refs.arrows.getDOMNode(), t, {attr: {y: 18}, ease: ease, delay: delay});
      TweenLite.to(this.refs.mask.getDOMNode(), t, {attr: {cy: -10}, ease: ease, delay: delay});
    } else {
      TweenLite.to(this.refs.arrows.getDOMNode(), t, {attr: {y: -2}, ease: ease, delay: delay});
      TweenLite.to(this.refs.mask.getDOMNode(), t, {attr: {cy: 10}, ease: ease, delay: delay});
    }
  }

  _play(bool, instant) {
    TweenLite.to([this.refs.arrow1.getDOMNode(), this.refs.arrow2.getDOMNode()], instant ? 0 : 0.2, {scale: bool ? 1.3 : 1, ease: Back.easeOut, transformOrigin: '50% 50%'});
  }
}

DownvoteIcon.defaultProps = {
  altered: false,
  played: false,
};

function DownvoteIconFactory(app) {
  SVG = SVGFactory(app);
  return app.mutate('core/components/DownvoteIcon', DownvoteIcon);
}

export default DownvoteIconFactory;
