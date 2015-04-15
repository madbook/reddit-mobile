import React from 'react';
import SVGFactory from '../components/SVG';
var SVG;

class SaveIcon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this._play = this._play.bind(this);
    this._alter = this._alter.bind(this);
  }

  render() {
    return (
      <SVG className='SVG-icon SaveIcon' width={20} height={20} fallbackText='save'>
        <circle className='SVG-fill' cx='10' cy='10' r='10'/>
        <path className='SVG-fill-bg' d='M12.5,16.666687l-2.500001-2.5l-2.499999,2.5V5.833333V5.816667c0-0.91127-0.755397-1.65-1.666667-1.65l0,0h5 c0.920475,0,1.666667,0.746192,1.666667,1.666667V16.666687z'/>
      </SVG>
    );
  }

  componentDidMount() {
    if (!SVG.ENABLED) {
      return;
    }
    if (this.props.altered) {
      this._alter(true, true);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!SVG.ENABLED) {
      return;
    }
    var altered = nextProps.altered;
    if (typeof altered !== 'undefined' && altered !== this.props.altered) {
      this._alter(altered);
    }
    var played = nextProps.played;
    if (typeof played !== 'undefined' && played !== this.props.played) {
      this._play(played);
    }
  }

  _play(bool, instant) {
    //TODO
  }

  _alter(bool, instant) {
    //TODO
  }
}

SaveIcon.defaultProps = {
  played: false,
  altered: false,
};

function SaveIconFactory(app) {
  SVG = SVGFactory(app);
  return app.mutate('core/components/SaveIcon', SaveIcon);
}

export default SaveIconFactory;
