import React from 'react';
import SVGFactory from '../components/SVG';
var SVG;

const _SIZE = 20;

class GoldIcon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this._play = this._play.bind(this);
  }

  render() {
    return (
      <SVG width={_SIZE} height={_SIZE} fallbackText='gold'>
        <circle fill='#d8c161' cx='10' cy='10' r='10'/>
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

function GoldIconFactory(app) {
  SVG = SVGFactory(app);
  return app.mutate('core/components/GoldIcon', GoldIcon);
}

export default GoldIconFactory;
