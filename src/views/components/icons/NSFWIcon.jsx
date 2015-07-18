import React from 'react';
import BaseComponent from '../../components/BaseComponent';
import SVG from '../../components/SVG';

const _STROKE = 0.53;
const _XS = [4, 8, 12, 16];
const _YS = [7.333328, 12.666672];

class NSFWIcon extends BaseComponent {
  constructor(props) {
    super(props);
    this._play = this._play.bind(this);
  }

  render() {
    return (
      <SVG className={'SVG-icon NSFWIcon' + (this.props.played ? ' played' : '')} fallbackIcon='icon-nsfw-circled'>
        <circle className='SVG-fill' cx={SVG.ICON_SIZE / 2} cy={SVG.ICON_SIZE / 2} r={SVG.ICON_SIZE / 2}/>
        <g ref='all' strokeLinecap='round' className='SVG-stroke-bg'>
          <line ref='kriss0' strokeWidth={_STROKE} x1={_XS[0]} y1={_YS[0]} x2={_XS[1]} y2={_YS[1]}/>
          <line ref='kross0' strokeWidth={_STROKE} x1={_XS[0]} y1={_YS[1]} x2={_XS[1]} y2={_YS[0]}/>
          <line ref='kriss1' strokeWidth={_STROKE} x1={_XS[1]} y1={_YS[0]} x2={_XS[2]} y2={_YS[1]}/>
          <line ref='kross1' strokeWidth={_STROKE} x1={_XS[1]} y1={_YS[1]} x2={_XS[2]} y2={_YS[0]}/>
          <line ref='kriss2' strokeWidth={_STROKE} x1={_XS[2]} y1={_YS[0]} x2={_XS[3]} y2={_YS[1]}/>
          <line ref='kross2' strokeWidth={_STROKE} x1={_XS[2]} y1={_YS[1]} x2={_XS[3]} y2={_YS[0]}/>
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

  _timeline() {
    if (!this._tl) {
      this._tl = new TimelineLite({paused: true});
      var all = this.refs.all.getDOMNode();
      var lines = all.querySelectorAll('line');
      for(var i = 0, iLen = lines.length; i < iLen; i++)
      {
        var line = lines[i];
        this._tl.add(TweenLite.to(line, 0.2, {attr: {'stroke-width': _STROKE * 2}}), i * 0.03);
      }
    }
    return this._tl;
  }

  _play(bool) {
    if(bool) {
      this._timeline().play();
    } else {
      this._timeline().reverse();
    }
  }
}

NSFWIcon.defaultProps = {
  played: false,
};

NSFWIcon.propTypes = {
  played: React.PropTypes.bool,
};

export default NSFWIcon;
