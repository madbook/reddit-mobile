import React from 'react';
import MyMath from '../../../lib/danehansen/utils/MyMath';
import Point from '../../../lib/danehansen/geom/Point';
import SVGFactory from '../../components/SVG';
var SVG;

const _MASK_SIZE = 11.4;
const _EYE_CENTER = 7.10293;
const _LOOK_DIST = 3;

class SearchIcon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this._look = this._look.bind(this);
    this._lookPause = this._lookPause.bind(this);
    this._maskID = 'mask' + Math.random();
  }

  render() {
    return (
      <SVG fallbackIcon='icon-search'>
        <defs>
          <clipPath id={this._maskID}>
            <rect ref='mask' x={_EYE_CENTER - _MASK_SIZE / 2} y={_EYE_CENTER} width={_MASK_SIZE} height='0' fill='#000'/>
          </clipPath>
        </defs>
        <circle className='SVG-stroke' fill='none' strokeWidth='2.3' cx={_EYE_CENTER} cy={_EYE_CENTER} r='5.7'/>
        <g ref='maskee' clipPath={'url(#' + this._maskID + ')'}>
          <circle className='SVG-stroke' fill='none' strokeWidth='1' cx={_EYE_CENTER} cy={_EYE_CENTER} r='3.5'/>
          <circle ref='pupil' className='SVG-fill' cx={_EYE_CENTER} cy={_EYE_CENTER} r='1.2'/>
        </g>
        <path className='SVG-fill' d='M17.703157,19.37462l-5.939255-5.939255c-0.167171-0.167171-0.167171-0.438208,0-0.605378l1.066085-1.066085 c0.167171-0.167171,0.438208-0.167171,0.605378,0l5.939255,5.939255c0.16717,0.16717,0.16717,0.438208,0,0.605377 l-1.066086,1.066086C18.141365,19.54179,17.870327,19.54179,17.703157,19.37462z'/>
      </SVG>
    );
  }

  componentDidMount() {
    if (!SVG.ENABLED) {
      return;
    }
    this.refs.maskee.getDOMNode().setAttribute('clip-path', 'url(#' + this._maskID + ')');
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

  _play(bool) {
    if (bool) {
      TweenLite.to(this.refs.mask.getDOMNode(), 0.1, {attr: {y: _EYE_CENTER - _MASK_SIZE / 2, height: _MASK_SIZE}, ease: Linear.easeNone});
      this._look();
    } else {
      TweenLite.to(this.refs.mask.getDOMNode(), 0.1, {attr: {y: _EYE_CENTER, height: 0}, ease: Linear.easeNone});
      clearTimeout(this._timeout);
      TweenLite.killTweensOf(this.refs.pupil.getDOMNode());
    }
  }

  _look() {
    var point = MyMath.randomPointInCircle({x: _EYE_CENTER, y: _EYE_CENTER}, _LOOK_DIST);
    TweenLite.to(this.refs.pupil.getDOMNode(), 0.1, {attr: {cx: point.x, cy: point.y}, ease: Linear.easeNone, onComplete: this._lookPause});
  }

  _lookPause() {
    this._timeout = setTimeout(this._look, MyMath.random(100, 700));
  }
}

SearchIcon.defaultProps = {
  played: false,
};

function SearchIconFactory(app) {
  SVG = SVGFactory(app);
  return app.mutate('core/components/icons/SearchIcon', SearchIcon);
}

export default SearchIconFactory;
