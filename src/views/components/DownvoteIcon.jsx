import React from 'react';
import SVGFactory from '../components/SVG';
import MyMath from '../../lib/danehansen/MyMath';
var SVG;

class DownvoteIcon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this._open = this._open.bind(this);
    this._hover = this._hover.bind(this);
    this._maskID = 'mask' + Math.random();
  }

  render() {
    return (
      <SVG width={20} height={20}>
        <defs>
          <clipPath id={this._maskID}>
            <circle ref='mask' fill='#000' cx='10' cy='10' r='10'/>
          </clipPath>
        </defs>
        <circle className='tween' fill={this.props.opened ? '#9494ff' : '#adadad'} cx='10' cy='10' r='10'/>
        <svg ref='arrows' fill='#fff' y='0' clip-path={'url(#' + this._maskID + ')'}>
          <path ref='arrow1' d='M10.052799,15.833334h0.000041l5.36036-5.825782c-0.002268-0.005168-0.001045-0.002383-0.003313-0.007551 h-3.321362c-0.000668-0.000668-0.001041-0.001042-0.001709-0.001709V5H7.92015v4.99648 c-0.001369,0.001369-0.002151,0.002151-0.00352,0.00352H4.586799L10.052799,15.833334z'/>
          <path ref='arrow2' d='M10.052799-4.166666h0.000041l5.36036-5.825782c-0.002268-0.005168-0.001045-0.002383-0.003313-0.007551 h-3.321362c-0.000668-0.000668-0.001041-0.001042-0.001709-0.001709v-4.998291H7.92015v4.99648 c-0.001369,0.001369-0.002151,0.002151-0.00352,0.00352H4.586799L10.052799-4.166666z'/>
        </svg>
      </SVG>
    );
  }

  componentDidMount() {
    this.refs.arrows.getDOMNode().setAttribute('clip-path', 'url(#' + this._maskID + ')');
  }

  componentWillReceiveProps(nextProps) {
    var opened = nextProps.opened;
    if (typeof opened != 'undefined' && opened != this.props.opened) {
      this._open(opened);
    }
    var hovered = nextProps.hovered;
    if (typeof hovered != 'undefined' && hovered != this.props.hovered) {
      this._hover(hovered);
    }
  }

  _open(bool) {
    var rand = MyMath.random(1, 4);
    var ease = Back.easeOut.config(rand);
    var t = 0.3 + (rand - 1) / 3 * 0.3;
    var delay = Math.random() * 0.1;
    if(bool) {
      TweenLite.to(this.refs.arrows.getDOMNode(), t, {attr:{y:20}, ease:ease, delay:delay});
      TweenLite.to(this.refs.mask.getDOMNode(), t, {attr:{cy:-10}, ease:ease, delay:delay});
    } else {
      TweenLite.to(this.refs.arrows.getDOMNode(), t, {attr:{y:0}, ease:ease, delay:delay});
      TweenLite.to(this.refs.mask.getDOMNode(), t, {attr:{cy:10}, ease:ease, delay:delay});
    }
  }

  _hover(bool) {
    TweenLite.to([this.refs.arrow1.getDOMNode(), this.refs.arrow2.getDOMNode()], 0.2, {scale:bool ? 1.3 : 1, ease:Back.easeOut, transformOrigin:'50% 50%'});
  }
}

DownvoteIcon.defaultProps = {
  opened:false,
  hovered:false,
};

function DownvoteIconFactory(app) {
  SVG = SVGFactory(app);
  return app.mutate('core/components/DownvoteIcon', DownvoteIcon);
}

export default DownvoteIconFactory;