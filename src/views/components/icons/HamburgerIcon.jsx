import React from 'react';
import BaseComponent from '../../components/BaseComponent';
import SVG from '../../components/SVG';

const _SIZE = 20;
const _MIDDLE = _SIZE / 2;
const _X_LEFT = 4.343146;
const _X_RIGHT = 15.656855;
const _HAMBURGER_WIDTH = 14;
const _HAMBURGER_SPACING = 5;
const _HAMBURGER_LEFT = (_SIZE - _HAMBURGER_WIDTH) / 2;
const _HAMBURGER_RIGHT = (_SIZE + _HAMBURGER_WIDTH) / 2;
const _T = 0.2;
const _TOP_BUN_Y = _SIZE / 2 - _HAMBURGER_SPACING;
const _BOTTOM_BUN_Y = _SIZE / 2 + _HAMBURGER_SPACING;

class HamburgerIcon extends BaseComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <SVG className='HamburgerIcon SVG-icon' width={_SIZE} height={_SIZE} fallbackIcon={this.props.altered ? 'icon-x' : 'icon-hamburger'}>
        <g ref='all' className='SVG-stroke' strokeWidth='2' strokeLinecap='square'>
          <line ref='topBun' x1={_HAMBURGER_LEFT} y1={_TOP_BUN_Y} x2={_HAMBURGER_RIGHT} y2={_TOP_BUN_Y}/>
          <line ref='patty' x1={_HAMBURGER_LEFT} y1={_MIDDLE} x2={_HAMBURGER_RIGHT} y2={_MIDDLE}/>
          <line ref='bottomBun' x1={_HAMBURGER_LEFT} y1={_BOTTOM_BUN_Y} x2={_HAMBURGER_RIGHT} y2={_BOTTOM_BUN_Y}/>
        </g>
      </SVG>
    );
  }

  componentDidUpdate(prevProps) {
    if (!SVG.ENABLED) {
      return;
    }
    var altered = prevProps.altered;
    var played = prevProps.played;
    if ((typeof altered !== 'undefined' && altered !== this.props.altered) || (typeof played !== 'undefined' && played !== this.props.played)) {
      this._transform();
    }
  }

  _transform() {
    var played = this.props.played;
    var altered = this.props.altered;
    var topBun = this.refs.topBun.getDOMNode();
    var patty = this.refs.patty.getDOMNode();
    var bottomBun = this.refs.bottomBun.getDOMNode();
    var all = this.refs.all.getDOMNode();

    if (played && altered) {
      //left
      TweenLite.to(all, _T, {rotation: 90, transformOrigin: '50% 50%', ease:Cubic.easeInOut});
      TweenLite.to(topBun, _T, {attr: {x1: _HAMBURGER_LEFT + _HAMBURGER_SPACING, y1: _TOP_BUN_Y, x2: _HAMBURGER_LEFT, y2: _MIDDLE}});
      TweenLite.to(patty, _T, {attr: {x1: _HAMBURGER_LEFT + 1, y1: _MIDDLE, x2: _HAMBURGER_RIGHT, y2: _MIDDLE}});
      TweenLite.to(bottomBun, _T, {attr: {x1: _HAMBURGER_LEFT + _HAMBURGER_SPACING, y1: _BOTTOM_BUN_Y, x2: _HAMBURGER_LEFT, y2: _MIDDLE}});
    } else if (played && !altered) {
      //right
      TweenLite.to(all, _T, {rotation: 90, transformOrigin: '50% 50%', ease:Cubic.easeInOut});
      TweenLite.to(topBun, _T, {attr: {x1: _HAMBURGER_RIGHT - _HAMBURGER_SPACING, y1: _TOP_BUN_Y, x2: _HAMBURGER_RIGHT, y2: _MIDDLE}});
      TweenLite.to(patty, _T, {attr: {x1: _HAMBURGER_LEFT, y1: _MIDDLE, x2: _HAMBURGER_RIGHT - 1, y2: _MIDDLE}});
      TweenLite.to(bottomBun, _T, {attr: {x1: _HAMBURGER_RIGHT - _HAMBURGER_SPACING, y1: _BOTTOM_BUN_Y, x2: _HAMBURGER_RIGHT, y2: _MIDDLE}});
    } else if (!played && altered) {
      //x
      TweenLite.to(all, _T, {rotation: 0, transformOrigin: '50% 50%', ease:Cubic.easeInOut});
      TweenLite.to(topBun, _T, {attr: {x1: _X_RIGHT, y1: _X_LEFT, x2: _X_LEFT, y2: _X_RIGHT}});
      TweenLite.to(patty, _T, {attr: {x1: _MIDDLE, y1: _MIDDLE, x2: _MIDDLE, y2: _MIDDLE}});
      TweenLite.to(bottomBun, _T, {attr: {x1: _X_RIGHT, y1: _X_RIGHT, x2: _X_LEFT, y2: _X_LEFT}});
    } else {
      //hamburger
      TweenLite.to(all, _T, {rotation: 0, transformOrigin: '50% 50%', ease:Cubic.easeInOut});
      TweenLite.to(topBun, _T, {attr: {x1: _HAMBURGER_LEFT, y1: _TOP_BUN_Y, x2: _HAMBURGER_RIGHT, y2: _TOP_BUN_Y}});
      TweenLite.to(patty, _T, {attr: {x1: _HAMBURGER_LEFT, y1: _MIDDLE, x2: _HAMBURGER_RIGHT, y2: _MIDDLE}});
      TweenLite.to(bottomBun, _T, {attr: {x1: _HAMBURGER_LEFT, y1: _BOTTOM_BUN_Y, x2: _HAMBURGER_RIGHT, y2: _BOTTOM_BUN_Y}});
    }
  }
}

HamburgerIcon.defaultProps = {
  played: false,
  altered: false,
};

HamburgerIcon.propTypes = {
  altered: React.PropTypes.bool,
  played: React.PropTypes.bool,
};

export default HamburgerIcon;
