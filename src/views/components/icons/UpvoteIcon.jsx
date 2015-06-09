import React from 'react';
import SVG from '../../components/SVG';

import MyMath from '../../../lib/danehansen/utils/MyMath';

class UpvoteIcon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this._alter = this._alter.bind(this);
    this._play = this._play.bind(this);
    this._maskID = 'mask' + global.random();
  }

  render() {
    return (
      <SVG className={'SVG-icon UpvoteIcon' + (this.props.altered ? ' altered' : '')} fallbackIcon='icon-upvote-circled'>
        <defs>
          <clipPath id={this._maskID}>
            <circle ref='mask' fill='#000' cx={SVG.ICON_SIZE * 0.5} cy={SVG.ICON_SIZE * 0.5} r={SVG.ICON_SIZE * 0.5}/>
          </clipPath>
        </defs>
        <circle className='tween SVG-fill' cx={SVG.ICON_SIZE / 2} cy={SVG.ICON_SIZE / 2} r={SVG.ICON_SIZE / 2}/>
        <svg ref='arrows' className='SVG-fill-bg' y='0' x='0' clipPath={'url(#' + this._maskID + ')'}>
          <path ref='arrow1' d='M9.947201,4.166667H9.94716L4.586799,9.992448C4.589067,9.997617,4.587845,9.994831,4.590113,10h3.321361 c0.000668,0.000668,0.001042,0.001041,0.001709,0.001709V15h4.166667v-4.99648 c0.001369-0.001369,0.002151-0.002151,0.00352-0.00352h3.32983L9.947201,4.166667z'/>
          <path ref='arrow2' d='M9.947201,24.166666H9.94716l-5.360361,5.825783C4.589067,29.997616,4.587845,29.994831,4.590113,30h3.321361 c0.000668,0.000668,0.001042,0.001041,0.001709,0.001709V35h4.166667v-4.996481 c0.001369-0.001368,0.002151-0.00215,0.00352-0.003519h3.32983L9.947201,24.166666z'/>
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
      TweenLite.to(this.refs.arrows.getDOMNode(), t, {attr: {y: -SVG.ICON_SIZE}, ease: ease, delay: delay});
      TweenLite.to(this.refs.mask.getDOMNode(), t, {attr: {cy: SVG.ICON_SIZE * 1.5}, ease: ease, delay: delay});
    } else {
      TweenLite.to(this.refs.arrows.getDOMNode(), t, {attr: {y: 0}, ease: ease, delay: delay});
      TweenLite.to(this.refs.mask.getDOMNode(), t, {attr: {cy: SVG.ICON_SIZE * 0.5}, ease: ease, delay: delay});
    }
  }

  _play(bool, instant) {
    TweenLite.to([this.refs.arrow1.getDOMNode(), this.refs.arrow2.getDOMNode()], instant ? 0 : 0.4, {scale: bool ? 1.3 : 1, ease: Back.easeOut, transformOrigin: '50% 50%'});
  }
}

UpvoteIcon.defaultProps = {
  altered: false,
  played: false,
};

export default UpvoteIcon;
