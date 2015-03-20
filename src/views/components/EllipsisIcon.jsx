import React from 'react';

import SVGFactory from '../components/SVG';
var SVG;

const _CENTER = 10;
const _DIST = 7.5;
const _DIAMETER = 2;

class EllipsisIcon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      opened:false
    };
    this._open = this._open.bind(this);
  }

  render() {
    return (
      <SVG width={20} height={20}>
        <g fill="#b8b8b8">
          <circle ref="one" cx={_CENTER - _DIST} cy={_CENTER} r={_DIAMETER}/>
          <circle cx={_CENTER} cy={_CENTER} r={_DIAMETER}/>
          <circle ref="three" cx={_CENTER + _DIST} cy={_CENTER} r={_DIAMETER}/>
        </g>
      </SVG>
    );
  }

  componentDidMount() {
    if (!SVG.ENABLED) {
      return;
    }
    var one = this.refs.one.getDOMNode();
    var three = this.refs.three.getDOMNode();
    var ease = Sine;
    this._timeline = new TimelineLite({paused: true});
    this._timeline.add(TweenLite.to([one, three], 0.2, {attr: {cx: _CENTER}, ease: ease.easeOut, overwrite: 0}), 0);
    this._timeline.add(TweenLite.to(one, 0.2, {attr: {cy: _CENTER - _DIST}, ease: ease.easeIn, overwrite: 0}), 0);
    this._timeline.add(TweenLite.to(three, 0.2, {attr: {cy: _CENTER + _DIST}, ease: ease.easeIn, overwrite: 0}), 0);
  }

  _open(bool) {
    if (bool) {
      this._timeline.play();
    } else {
      this._timeline.reverse();
    }
    this.setState({opened: bool});
  }

  componentWillReceiveProps(nextProps) {
    if (!SVG.ENABLED) {
      return;
    }
    var opened = nextProps.opened;
    if (typeof opened !== 'undefined' && opened !== this.state.opened) {
      this._open(opened);
    }
  }
}

function EllipsisIconFactory(app) {
  SVG = SVGFactory(app);
  return app.mutate('core/components/EllipsisIcon', EllipsisIcon);
}

export default EllipsisIconFactory;
