import React from 'react';
import SVGFactory from '../../components/SVG';
var SVG;

class ReplyIcon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this._play = this._play.bind(this);
    this._alter = this._alter.bind(this);
  }

  render() {
    return (
      <SVG className='SVG-icon ReplyIcon' fallbackIcon='icon-reply-circled'>
        <circle className='SVG-fill' cx={SVG.ICON_SIZE / 2} cy={SVG.ICON_SIZE / 2} r={SVG.ICON_SIZE / 2}/>
        <g ref='all'>
          <rect className='SVG-stroke-bg' fill='none' strokeWidth='1.287276' x='4.276652' y='5.866364' width='11.446696' height='8.267272'/>
          <path ref='arrow' className='SVG-stroke SVG-fill-bg' strokeMiterlimit='3' d='M6.532227,11.37793c0-4.53418,3.881348-5.956055,6.315918-6.125977l0.002441-2.852539l6.402344,4.962891 l-6.401855,4.963867L12.845215,8.65918c-0.141602-0.019531-0.285156-0.029297-0.429199-0.029297 c-2.585449,0-4.964844,3.024414-4.98877,3.054688l-0.89502,1.151367V11.37793z'/>
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
    var altered = nextProps.altered;
    if (typeof altered !== 'undefined' && altered !== this.props.altered) {
      this._alter(altered);
    }
  }

  componentDidMount() {
    if (!SVG.ENABLED) {
      return;
    }
    this.refs.arrow.getDOMNode().setAttribute('stroke-miterlimit', 3);
  }

  _play(bool) {
    TweenLite.to(this.refs.all.getDOMNode(), 0.4, {scale: bool ? 1.2 : 1, ease: Back.easeOut, transformOrigin: '50% 50%'});
  }

  _alter(bool) {
    TweenLite.to(this.refs.arrow.getDOMNode(), 0.4, {x: bool ? 1 : 0, y: bool ? 2 : 0, rotation: bool ? 90 : 0, ease: Cubic.easeInOut, transformOrigin: '50% 50%'});
  }
}

ReplyIcon.defaultProps = {
  played: false,
  altered: false,
};

function ReplyIconFactory(app) {
  SVG = SVGFactory(app);
  return app.mutate('core/components/icons/ReplyIcon', ReplyIcon);
}

export default ReplyIconFactory;
