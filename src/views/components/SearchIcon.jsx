import React from 'react';
import MyMath from '../../lib/danehansen/MyMath';
import Point from '../../lib/danehansen/Point';
import SVGFactory from '../components/SVG';
var SVG;

const _MASK_SIZE = 7.322315;
const _MASK_TOP = 3.446049;
const _EYE_CENTER = 7.10293;
const _LOOK_DIST = 3;

class SearchIcon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      opened:false,
    };
    this._look = this._look.bind(this);
    this._lookPause = this._lookPause.bind(this);
  }

  render() {
        // <circle ref='eyeball' fill='#b8b8b8' cx={_EYE_CENTER} cy={_EYE_CENTER} r='3.665432' clip-path='url(#nav_search_mask)'/>
    return (
      <SVG width={20} height={20}>
        <defs>
          <clipPath id='nav_search_mask'>
            <rect ref='mask' x='3.441775' y={_MASK_TOP+_MASK_SIZE/2} width={_MASK_SIZE} height='0' fill='#000'/>
          </clipPath>
        </defs>
        <path fill='#b8b8b8' d='M17.703157,19.37462l-5.939255-5.939255c-0.167171-0.167171-0.167171-0.438208,0-0.605378l1.066085-1.066085 c0.167171-0.167171,0.438208-0.167171,0.605378,0l5.939255,5.939255c0.16717,0.16717,0.16717,0.438208,0,0.605377 l-1.066086,1.066086C18.141365,19.54179,17.870327,19.54179,17.703157,19.37462z'/>
        <path fill='#b8b8b8' d='M7.10293,2.5c2.53806,0,4.60293,2.06487,4.60293,4.60293s-2.06487,4.60293-4.60293,4.60293 S2.5,9.64099,2.5,7.10293S4.56487,2.5,7.10293,2.5 M7.10293,0.5C3.45623,0.5,0.5,3.45623,0.5,7.10293 s2.95623,6.60293,6.60293,6.60293s6.60293-2.95623,6.60293-6.60293S10.74963,0.5,7.10293,0.5L7.10293,0.5z'/>
        <circle ref='pupil' fill='#b8b8b8' cx={_EYE_CENTER} cy={_EYE_CENTER} r='1.2' clip-path='url(#nav_search_mask)'/>
      </SVG>
    );
  }

  componentDidMount() {
    this.refs.pupil.getDOMNode().setAttribute('clip-path', 'url(#nav_search_mask)');
  }

  componentWillReceiveProps(nextProps) {
    var opened = nextProps.opened;
    if (typeof opened != 'undefined' && opened != this.state.opened)
      this._open(opened);
  }

  _open(bool) {
    this.setState({opened:bool}, this._transform);
    if(bool) {
      TweenLite.to(this.refs.mask.getDOMNode(), 0.1, {attr:{y:_MASK_TOP, height:_MASK_SIZE}, ease:Linear.easeNone});
      this._look();
    }
    else {
      TweenLite.to(this.refs.mask.getDOMNode(), 0.1, {attr:{y:_MASK_TOP+_MASK_SIZE/2, height:0}, ease:Linear.easeNone});
      clearTimeout(this._timeout);
      TweenLite.killTweensOf(this.refs.pupil.getDOMNode());
    }
  }

  _look() {
    var point = MyMath.randomPointInCircle({x:_EYE_CENTER, y:_EYE_CENTER}, _LOOK_DIST);
    TweenLite.to(this.refs.pupil.getDOMNode(), 0.1, {attr:{cx:point.x, cy:point.y}, ease:Linear.easeNone, onComplete:this._lookPause});
  }

  _lookPause() {
    this._timeout = setTimeout(this._look, MyMath.random(100, 700));
  }
}

function SearchIconFactory(app) {
  SVG = SVGFactory(app);
  return app.mutate('core/components/SearchIcon', SearchIcon);
}

export default SearchIconFactory;