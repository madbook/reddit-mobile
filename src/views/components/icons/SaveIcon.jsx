import React from 'react';
import BaseComponent from '../../components/BaseComponent';
import SVG from '../../components/SVG';

const _LEFT = 8.3;
const _RIGHT = 11.7;

class SaveIcon extends BaseComponent {
  constructor(props) {
    super(props);
    this._play = this._play.bind(this);
    this._alter = this._alter.bind(this);
  }

  render() {
    return (
      <SVG className={'SVG-icon SaveIcon' + (this.props.altered ? ' altered' : '')} fallbackIcon={this.props.altered ? 'icon-unsave-circled' : 'icon-save-circled'}>
        <circle className='SVG-fill tween' cx={SVG.ICON_SIZE / 2} cy={SVG.ICON_SIZE / 2} r={SVG.ICON_SIZE / 2}/>
        <g ref='ribbon'>
          <path className='SVG-fill-bg' d='M12.5,16.666687l-2.500001-2.5l-2.499999,2.5V5.833333V5.816667c0-0.91127-0.755397-1.65-1.666667-1.65l0,0h5 c0.920475,0,1.666667,0.746192,1.666667,1.666667V16.666687z'/>
          <g strokeWidth='0.9' className='SVG-stroke tween'>
            <line ref='kriss' fill='none' x1={_LEFT} y1={_LEFT} x2={_LEFT} y2={_LEFT}/>
            <line ref='kross' fill='none' x1={_RIGHT} y1={_LEFT} x2={_RIGHT} y2={_LEFT}/>
          </g>
        </g>
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
    TweenLite.to(this.refs.ribbon.getDOMNode(), instant ? 0 : 0.4, {scale: bool ? 1.3 : 1, ease: Back.easeOut, transformOrigin: '50% 50%'});
  }

  _alter(bool, instant) {
    if (bool) {
      TweenLite.to(this.refs.kriss.getDOMNode(), 0.2, {attr: {x2: _RIGHT, y2: _RIGHT}});
      TweenLite.to(this.refs.kross.getDOMNode(), 0.2, {attr: {x2: _LEFT, y2: _RIGHT}, delay: 0.2});
    } else {
      TweenLite.to(this.refs.kross.getDOMNode(), 0.2, {attr: {x2: _RIGHT, y2: _LEFT}});
      TweenLite.to(this.refs.kriss.getDOMNode(), 0.2, {attr: {x2: _LEFT, y2: _LEFT}, delay: 0.2});
    }
  }
}

SaveIcon.defaultProps = {
  played: false,
  altered: false,
};

SaveIcon.propTypes = {
  altered: React.PropTypes.bool,
  played: React.PropTypes.bool,
};

export default SaveIcon;
