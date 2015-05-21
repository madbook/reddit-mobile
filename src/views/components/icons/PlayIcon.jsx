import React from 'react';
import SVG from '../../components/SVG';

class PlayIcon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this._open = this._open.bind(this);
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
    var opened = nextProps.opened;
    if (typeof opened !== 'undefined' && opened !== this.props.opened) {
      this._open(opened);
    }
  }

  _open(bool) {
    if (bool) {
      // TODO
    } else {
      // TODO
    }
  }
}

PlayIcon.defaultProps = {
  opened: false,
};

export default PlayIcon;
