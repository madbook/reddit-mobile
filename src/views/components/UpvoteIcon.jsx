import React from 'react';
import SVGFactory from '../components/SVG';
import MyMath from '../../lib/danehansen/MyMath';
var SVG;

class UpvoteIcon extends React.Component {
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
        <circle className='tween' fill={this.props.opened ? '#ff4500' : '#adadad'} cx='10' cy='10' r='10'/>
        <svg ref='arrows' fill='#fff' y='0' clip-path={'url(#' + this._maskID + ')'}>
          <path ref='arrow1' d='M9.947201,4.166667H9.94716L4.586799,9.992448C4.589067,9.997617,4.587845,9.994831,4.590113,10h3.321361 c0.000668,0.000668,0.001042,0.001041,0.001709,0.001709V15h4.166667v-4.99648 c0.001369-0.001369,0.002151-0.002151,0.00352-0.00352h3.32983L9.947201,4.166667z'/>
          <path ref='arrow2' d='M9.947201,24.166666H9.94716l-5.360361,5.825783C4.589067,29.997616,4.587845,29.994831,4.590113,30h3.321361 c0.000668,0.000668,0.001042,0.001041,0.001709,0.001709V35h4.166667v-4.996481 c0.001369-0.001368,0.002151-0.00215,0.00352-0.003519h3.32983L9.947201,24.166666z'/>
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
      TweenLite.to(this.refs.arrows.getDOMNode(), t, {attr:{y:-20}, ease:ease, delay:delay});
      TweenLite.to(this.refs.mask.getDOMNode(), t, {attr:{cy:30}, ease:ease, delay:delay});
    } else {
      TweenLite.to(this.refs.arrows.getDOMNode(), t, {attr:{y:0}, ease:ease, delay:delay});
      TweenLite.to(this.refs.mask.getDOMNode(), t, {attr:{cy:10}, ease:ease, delay:delay});
    }
  }

  _hover(bool) {
    TweenLite.to([this.refs.arrow1.getDOMNode(), this.refs.arrow2.getDOMNode()], 0.2, {scale:bool ? 1.3 : 1, ease:Back.easeOut, transformOrigin:'50% 50%'});
  }
}

UpvoteIcon.defaultProps = {
  opened:false,
  hovered:false,
};

function UpvoteIconFactory(app) {
  SVG = SVGFactory(app);
  return app.mutate('core/components/UpvoteIcon', UpvoteIcon);
}

export default UpvoteIconFactory;