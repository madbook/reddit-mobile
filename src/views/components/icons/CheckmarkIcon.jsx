import React from 'react';
import SVG from '../../components/SVG';
import globals from '../../../globals';

class CheckmarkIcon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this._play = this._play.bind(this);
    this._maskID = 'mask' + globals().random();
  }

  render() {
    return (
      <SVG className='SVG-icon CheckmarkIcon' fallbackIcon={this.props.played ? 'icon-check' : null}>
        <defs>
          <clipPath id={this._maskID}>
            <rect ref='mask' x='0' y='0' width='0' height={SVG.ICON_SIZE} fill='#000'/>
          </clipPath>
        </defs>
        <polyline ref='line' fill='none' stroke='#52AA19' strokeWidth='2' strokeMiterlimit='10' points='2.575379,10 7.525126,14.949747 17.424622,5.050252' clipPath={'url(#'+this._maskID+')'}/>
      </SVG>
    );
  }

  componentDidMount() {
    if (!SVG.ENABLED) {
      return;
    }
    this.refs.line.getDOMNode().setAttribute('clip-path', 'url(#' + this._maskID + ')');
    if (this.props.played) {
      this._play(true);
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

  _play(bool) {
    TweenLite.to(this.refs.mask.getDOMNode(), 0.2, {attr: {width: bool ? SVG.ICON_SIZE : 0}, ease: Linear.easeNone});
  }
}

CheckmarkIcon.defaultProps = {
  played: false,
};

export default CheckmarkIcon;
