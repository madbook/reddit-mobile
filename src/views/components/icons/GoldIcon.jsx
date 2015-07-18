import React from 'react';
import BaseComponent from '../../components/BaseComponent';
import SVG from '../../components/SVG';

class GoldIcon extends BaseComponent {
  constructor(props) {
    super(props);
    this._play = this._play.bind(this);
  }

  render() {
    return (
      <SVG fallbackIcon='icon-gold-circled' className={'SVG-icon' + (this.props.altered ? ' altered' : '')}>
        <circle className='SVG-fill tween' cx={SVG.ICON_SIZE / 2} cy={SVG.ICON_SIZE / 2} r={SVG.ICON_SIZE / 2}/>
        <polygon className='SVG-fill-bg' points='17.088745,7.666626 12.190491,6.954895 10,2.516357 7.809448,6.954895 2.911133,7.666626 6.455566,11.121582 5.618774,16 10,13.696655 14.380981,16 13.544312,11.121582'/>
      </SVG>
    );
  }

  componentDidUpdate(prevProps) {
    if (!SVG.ENABLED) {
      return;
    }
    var played = prevProps.played;
    if (typeof played !== 'undefined' && played !== this.props.played && this.props.played === true) {
      this._play();
    }
  }

  _play() {
    if (this.props.played) {
      TweenLite.from(React.findDOMNode(this), 0.3, {rotation: -360 / 5, ease: Linear.easeNone, onComplete: this._play, clearProps: 'all'});
    }
  }
}

GoldIcon.defaultProps = {
  played: false,
};

GoldIcon.propTypes = {
  played: React.PropTypes.bool,
};

export default GoldIcon;
