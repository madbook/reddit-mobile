import React from 'react';
import SVGFactory from '../components/SVG';
var SVG;

class PlayIcon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this._open = this._open.bind(this);
  }

  render() {
    return (
      <SVG width={20} height={20} className='PlayIcon'>
        <path fill='#fff' d='M10,0C4.477173,0,0,4.477112,0,10c0,5.522827,4.477173,10,10,10s10-4.477173,10-10 C20,4.477112,15.522827,0,10,0z M7.5,15V4.999817l7.500061,5.000122L7.5,15z'/>
        <polygon fill='#000' points='7.5,15 15.000061,9.999939 7.5,4.999817 '/>
      </SVG>
    );
  }

  componentWillReceiveProps(nextProps) {
    var opened = nextProps.opened;
    if (typeof opened !== 'undefined' && opened !== this.props.opened) {
      this._open(opened);
    }
    var hovered = nextProps.hovered;
    if (typeof hovered !== 'undefined' && hovered !== this.props.hovered) {
      this._hover(hovered);
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

function PlayIconFactory(app) {
  SVG = SVGFactory(app);
  return app.mutate('core/components/PlayIcon', PlayIcon);
}

export default PlayIconFactory;
