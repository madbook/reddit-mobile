import React from 'react';
import SVG from '../../components/SVG';

class PlayIcon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this._play = this._play.bind(this);
  }

  render() {
    return (
      <SVG className='PlayIcon' fallbackIcon='icon-play-circled'>
        <path fill='#fff' d='M10,0C4.477173,0,0,4.477112,0,10c0,5.522827,4.477173,10,10,10s10-4.477173,10-10 C20,4.477112,15.522827,0,10,0z M7.5,15V4.999817l7.500061,5.000122L7.5,15z'/>
        <polygon fill='#000' points='7.5,15 15.000061,9.999939 7.5,4.999817 '/>
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
    if (bool) {
      // TODO
    } else {
      // TODO
    }
  }
}

PlayIcon.defaultProps = {
  played: false,
};

export default PlayIcon;
