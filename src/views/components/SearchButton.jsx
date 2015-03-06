import React from 'react';
import MyMath from '../../lib/danehansen/MyMath';
import Point from '../../lib/danehansen/Point';

const _MASK_SIZE = 7.322315;
const _MASK_TOP = 2.946049;
const _EYE_CENTER = 6.602932;
const _LOOK_DIST = 3;

class SearchButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
    this._onMouseEnter = this._onMouseEnter.bind(this);
    this._onMouseLeave = this._onMouseLeave.bind(this);
    this._look = this._look.bind(this);
    this._lookPause = this._lookPause.bind(this);

    this._timeout;
  }

  render() {
    return (
      <button className='SearchButton' onMouseEnter={this._onMouseEnter} onMouseLeave={this._onMouseLeave} onTouchStart={this._onMouseEnter} onTouchEnd={this._onMouseLeave}>
        <svg version='1.1' xmlns='http://www.w3.org/2000/svg' x='0px' y='0px' width='19px' height='19px' viewBox='0 0 19 19'>
          <defs>
            <clipPath id='nav_search_mask'>
              <rect ref='mask' x='2.941775' y={_MASK_TOP+_MASK_SIZE/2} width={_MASK_SIZE} height='0' fill='#000'/>
            </clipPath>
          </defs>
          <path fill='#fff' d='M17.203159,18.874622l-5.939255-5.939255c-0.167171-0.167171-0.167171-0.438208,0-0.605378l1.066085-1.066085 c0.167171-0.167171,0.438208-0.167171,0.605378,0l5.939255,5.939255c0.16717,0.16717,0.16717,0.438208,0,0.605377 l-1.066086,1.066086C17.641367,19.041792,17.370329,19.041792,17.203159,18.874622z'/>
          <path fill='#fff' d='M6.602932,2.000002c2.53806,0,4.60293,2.06487,4.60293,4.60293s-2.06487,4.60293-4.60293,4.60293 s-4.60293-2.06487-4.60293-4.60293S4.064872,2.000002,6.602932,2.000002 M6.602932,0.000002 c-3.6467,0-6.60293,2.95623-6.60293,6.60293s2.95623,6.60293,6.60293,6.60293s6.60293-2.95623,6.60293-6.60293 S10.249632,0.000002,6.602932,0.000002L6.602932,0.000002z'/>
          <circle ref='eyeball' fill='#fff' cx={_EYE_CENTER} cy={_EYE_CENTER} r='3.665432' clip-path='url(#nav_search_mask)'/>
          <circle ref='pupil' fill='#126D92' cx={_EYE_CENTER} cy={_EYE_CENTER} r='1.2'/>
        </svg>
      </button>
    );
  }

  componentDidMount() {
    this.refs.eyeball.getDOMNode().setAttribute('clip-path', 'url(#nav_search_mask)');
  }

  _onMouseEnter() {
    TweenLite.to(this.refs.mask.getDOMNode(), 0.1, {attr:{y:_MASK_TOP, height:_MASK_SIZE}, ease:Linear.easeNone});
    this._look();
  }

  _onMouseLeave() {
    TweenLite.to(this.refs.mask.getDOMNode(), 0.1, {attr:{y:_MASK_TOP+_MASK_SIZE/2, height:0}, ease:Linear.easeNone});
    clearTimeout(this._timeout);
    TweenLite.killTweensOf(this.refs.pupil.getDOMNode());
  }

  _look() {
    var point = MyMath.randomPointInCircle({x:_EYE_CENTER, y:_EYE_CENTER}, _LOOK_DIST);
    TweenLite.to(this.refs.pupil.getDOMNode(), 0.1, {attr:{cx:point.x, cy:point.y}, ease:Linear.easeNone, onComplete:this._lookPause});
  }

  _lookPause() {
    this._timeout = setTimeout(this._look, MyMath.random(100, 700));
  }
}

function SearchButtonFactory(app) {
  return app.mutate('core/components/searchButton', SearchButton);
}

export default SearchButtonFactory;