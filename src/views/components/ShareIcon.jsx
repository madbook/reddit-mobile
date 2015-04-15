import React from 'react';
import SVGFactory from '../components/SVG';
var SVG;

class ShareIcon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this._play = this._play.bind(this);
  }

  render() {
    return (
      <SVG className='SVG-icon ShareIcon' width={20} height={20} fallbackText='share'>
        <circle className='SVG-fill' cx='10' cy='10' r='10'/>
        <polygon className='SVG-fill-bg' points='2.928955,8.821472 7.92926,11.599365 15.151794,4.37677 '/>
        <polygon className='SVG-fill-bg' points='11.178528,17.070984 15.623169,4.848206 8.400574,12.07074 '/>
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
  }

  _play(bool, instant) {
    //TODO
  }
}

ShareIcon.defaultProps = {
  played: false,
};

function ShareIconFactory(app) {
  SVG = SVGFactory(app);
  return app.mutate('core/components/ShareIcon', ShareIcon);
}

export default ShareIconFactory;
