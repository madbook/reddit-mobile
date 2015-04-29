import React from 'react';
import SVGFactory from '../../components/SVG';
var SVG;

class TextIcon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this._play = this._play.bind(this);
  }

  render() {
    return (
      <SVG className='SVG-icon TextIcon' fallbackIcon='icon-text-circled'>
        <circle className='SVG-fill' cx={SVG.ICON_SIZE / 2} cy={SVG.ICON_SIZE / 2} r={SVG.ICON_SIZE / 2}/>
        <g ref='all'>
          <rect className='SVG-fill-bg' x='6.666687' y='5.333313' width='6.666626' height='9.333313'/>
          <g className='SVG-stroke' strokeWidth='0.4'>
            <line x1="7.133362" y1="10.666656" x2="12.866638" y2="10.666656"/>
            <line x1="7.133362" y1="8.666656" x2="12.866638" y2="8.666656"/>
            <line x1="7.133362" y1="9.666656" x2="12.866638" y2="9.666656"/>
            <line x1="7.133362" y1="7.666656" x2="12.866638" y2="7.666656"/>
            <line x1="7.133362" y1="12.666656" x2="12.866638" y2="12.666656"/>
            <line x1="7.133362" y1="13.666656" x2="12.866638" y2="13.666656"/>
            <line x1="7.133362" y1="11.666656" x2="12.866638" y2="11.666656"/>
          </g>
        </g>
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
    TweenLite.to(this.refs.all.getDOMNode(), instant ? 0 : 0.4, {scale: bool ? 1.3 : 1, ease: Back.easeOut, transformOrigin: '50% 50%'});
  }
}

TextIcon.defaultProps = {
  played: false,
};

function TextIconFactory(app) {
  SVG = SVGFactory(app);
  return app.mutate('core/components/icons/TextIcon', TextIcon);
}

export default TextIconFactory;
