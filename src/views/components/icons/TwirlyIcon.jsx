import React from 'react';
import SVG from '../../components/SVG';

class TwirlyIcon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      altered: false,
    };
    this._play = this._play.bind(this);
  }

  render() {
    return (
      <SVG className={'SVG-icon TwirlyIcon' + (this.props.altered ? ' altered' : '')} fallbackIcon='icon-play-circled'>
        <circle className='SVG-fill' cx={SVG.ICON_SIZE / 2} cy={SVG.ICON_SIZE / 2} r={SVG.ICON_SIZE / 2}/>
        <polygon ref='all' className='SVG-fill-bg' points='7.5,15 15.000061,9.999939 7.5,4.999817 '/>
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

  _play(bool) {
    TweenLite.to(this.refs.all.getDOMNode(), 0.4, {scale: bool ? 1.2 : 1, ease: Back.easeOut, transformOrigin: '50% 50%'});
  }
}

TwirlyIcon.defaultProps = {
  opened: false,
};

export default TwirlyIcon;
