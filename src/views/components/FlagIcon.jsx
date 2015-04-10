import React from 'react';
import SVGFactory from '../components/SVG';
var SVG;

class FlagIcon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this._play = this._play.bind(this);
  }

  render() {
    return (
      <SVG className='SVG-icon FlagIcon' width={20} height={20} fallbackText='flag'>
        <circle className='SVG-fill' cx='10' cy='10' r='10'/>
        <path className='SVG-fill-bg' d='M5,4.666667C4.815917,4.666667,4.666666,4.815918,4.666666,5v10.833333c0,0.184083,0.149251,0.333333,0.333333,0.333333 s0.333333-0.14925,0.333333-0.333333V5C5.333333,4.815918,5.184082,4.666667,5,4.666667z'/>
        <path className='SVG-fill-bg' d='M10.833333,5.46404c-2.142863,1.19048-5-0.238098-5-0.238098v6.666667c0,0,2.857137,1.19048,5,0.238098 c2.240071-0.995585,5,0.238098,5,0.238098V5.702138C15.833333,5.702138,12.883219,4.325226,10.833333,5.46404z'/>
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

FlagIcon.defaultProps = {
  played: false,
};

function FlagIconFactory(app) {
  SVG = SVGFactory(app);
  return app.mutate('core/components/FlagIcon', FlagIcon);
}

export default FlagIconFactory;
