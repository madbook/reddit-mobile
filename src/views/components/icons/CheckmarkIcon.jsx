import React from 'react';
import SVGFactory from '../../components/SVG';
var SVG;

class CheckmarkIcon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this._play = this._play.bind(this);
    this._maskID = 'mask' + Math.random();
  }

  render() {
    return (
      <SVG fallbackIcon={this.props.played ? 'icon-check' : null}>
        <defs>
          <clipPath id={this._maskID}>
            <rect ref='mask' x='0' y='0' width='0' height={SVG.ICON_SIZE} fill='#000'/>
          </clipPath>
        </defs>
        <polyline ref='line' fill='none' stroke='#52AA19' strokeWidth='2' strokeMiterlimit='10' points='2.575379,10 7.525126,14.949747 17.424622,5.050252' clip-path={'url(#'+this._maskID+')'}/>
      </SVG>
    );
  }

  componentDidMount() {
    if (!SVG.ENABLED) {
      return;
    }
    this.refs.line.getDOMNode().setAttribute('clip-path', 'url(#' + this._maskID + ')');
    if (this.props.played) {
      this._play(true, true);
    }
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

  _play(bool, instant) {
    TweenLite.to(this.refs.mask.getDOMNode(), instant ? 0 : 0.2, {attr: {width: bool ? SVG.ICON_SIZE : 0}, ease: Linear.easeNone});
  }
}

CheckmarkIcon.defaultProps = {
  played: false,
};

function CheckmarkIconFactory(app) {
  SVG = SVGFactory(app);
  return app.mutate('core/components/icons/CheckmarkIcon', CheckmarkIcon);
}

export default CheckmarkIconFactory;
