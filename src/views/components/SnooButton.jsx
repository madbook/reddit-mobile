import React from 'react';
import MyMath from '../../lib/danehansen/MyMath';
import Point from '../../lib/danehansen/Point';

const _MOUTH_STROKE = 1.0875;
const _DINGLEBERRY_CENTER = {x:22.65625, y:6.71875};
const _ELBOW = {x:14.5, y:4.725};
const _ROOT = {x:14.5, y:13.0625};
const _REPEL_RADIUS = 10;
const _REPEL_FORCE = -0.05;
const _RETURN_FORCE = 0.05;

class SnooButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
    this._onMouseEnter = this._onMouseEnter.bind(this);
    this._onMouseLeave = this._onMouseLeave.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onTick = this._onTick.bind(this);

    this._mouse = {};
    this._dingleberryCenter = {x:_DINGLEBERRY_CENTER.x, y:_DINGLEBERRY_CENTER.y};

    this._baseLength = Point.distance(_ROOT, _ELBOW);
    this._endLength = Point.distance(_DINGLEBERRY_CENTER, _ELBOW);
    this._ticking = false;
  }

  render() {
    return (
      <a href='/' className='SnooButton' onMouseEnter={this._onMouseEnter} onMouseLeave={this._onMouseLeave} onMouseMove={this._onMouseMove} onTouchStart={this._onMouseEnter} onTouchMove={this._onMouseMove} onTouchEnd={this._onMouseLeave}>
        <svg ref='svg' version='1.1' xmlns='http://www.w3.org/2000/svg' x='0px' y='0px' width='29px' height='33px' viewBox='0 0 29 33'>
          <ellipse ref='head' fill='#fff' cx='14.5' cy='23.03125' rx='12.6875' ry='9.96875'/>
          <circle ref='leftEar' fill='#fff' cx='3.625' cy='18.5' r='3.625'/>
          <circle ref='rightEar' fill='#fff' cx='25.375' cy='18.5' r='3.625'/>
          <path ref='mouth' fill='none' stroke='#0f6b8f' strokeWidth={_MOUTH_STROKE} strokeLinecap='round' d='M19.9375,28.143154c-1.515734,0.798412-3.394432,1.27738-5.4375,1.27738s-3.921766-0.478968-5.4375-1.27738'/>
          <circle ref='leftEye' fill='#0f6b8f' cx='8.88125' cy='22.125' r='2.71875'/>
          <circle ref='rightEye' fill='#0f6b8f' cx='20.11875' cy='22.125' r='2.71875'/>
          <g fill='none' stroke='#fff' strokeWidth='1.45' strokeLinecap='round'>
            <line ref='stemBase' x1={_ELBOW.x} y1={_ELBOW.y} x2={_ROOT.x} y2={_ROOT.y}/>
            <line ref='stemEnd' x1={_ELBOW.x} y1={_ELBOW.y} x2={_DINGLEBERRY_CENTER.x} y2={_DINGLEBERRY_CENTER.y}/>
          </g>
          <circle ref='dingleberry' fill='#fff' cx={_DINGLEBERRY_CENTER.x} cy={_DINGLEBERRY_CENTER.y} r='2.71875'/>
        </svg>
      </a>
    );
  }

  componentWillUnmount() {
    if(this._ticking)
      TweenLite.ticker.removeEventListener('tick', this._onTick);
  }

  _onMouseEnter(evt) {
    TweenLite.to(this.refs.mouth.getDOMNode(), 0.1, {attr:{'stroke-width':3}, ease:Linear.easeNone});
    this._onMouseMove(evt)
  }

  _onMouseLeave() {
    TweenLite.to(this.refs.mouth.getDOMNode(), 0.1, {attr:{'stroke-width':_MOUTH_STROKE}, ease:Linear.easeNone});
    this._mouse.x = Number.MAX_VALUE;
    this._mouse.y = Number.MAX_VALUE;
  }

  _onMouseMove(evt) {
    this._mouse = Point.relativePosition(evt.nativeEvent, this.refs.svg.getDOMNode());
    if (!this._ticking)
    {
      this._ticking=true;
      TweenLite.ticker.addEventListener('tick', this._onTick);
    }
  }

  _onTick() {
    //find distance
      var xDist = Math.abs(this._dingleberryCenter.x-this._mouse.x);
      var yDist = Math.abs(this._dingleberryCenter.y-this._mouse.y);
      var dist = Math.sqrt(Math.pow(xDist,2)+Math.pow(yDist,2))
    //repel mouse if close enough
      if (dist < _REPEL_RADIUS)
      {
        var totalDist = xDist + yDist;
        var force = (_REPEL_RADIUS - dist) / _REPEL_RADIUS * _REPEL_FORCE;
        MyMath.velocityEase(this._dingleberryCenter, 'x', this._mouse.x, xDist / totalDist * force);
        MyMath.velocityEase(this._dingleberryCenter, 'y', this._mouse.y, yDist / totalDist * force);
      }
    //return to centerpoint
      var diff = MyMath.velocityEase(this._dingleberryCenter, 'x', _DINGLEBERRY_CENTER.x, _RETURN_FORCE);
      diff += MyMath.velocityEase(this._dingleberryCenter, 'y', _DINGLEBERRY_CENTER.y, _RETURN_FORCE);
      if (Math.abs(diff) < 0.01 && Point.distance(_DINGLEBERRY_CENTER, this._dingleberryCenter) < 0.01)
      {
        this._ticking = false;
        TweenLite.ticker.removeEventListener('tick', this._onTick);
      }
    //set dingleberry to new position
      var dingleberry = this.refs.dingleberry.getDOMNode();
      dingleberry.setAttribute('cx', this._dingleberryCenter.x);
      dingleberry.setAttribute('cy', this._dingleberryCenter.y);
    //set stem end tip to new position
      var stemEnd = this.refs.stemEnd.getDOMNode();
      stemEnd.setAttribute('x2', this._dingleberryCenter.x);
      stemEnd.setAttribute('y2', this._dingleberryCenter.y);
    //find potential elbow points
      var pot = MyMath.circleIntersection(this._dingleberryCenter, this._endLength, _ROOT, this._baseLength);
    //choose which one is closest to original elbow
      var dist1 = Point.distance(pot[0], _ELBOW);
      var dist2 = Point.distance(pot[1], _ELBOW);
      var elbow = dist1 > dist2?pot[1]:pot[0];
    //set elbow position
      stemEnd.setAttribute('x1', elbow.x);
      stemEnd.setAttribute('y1', elbow.y);
      var stemBase = this.refs.stemBase.getDOMNode();
      stemBase.setAttribute('x1', elbow.x);
      stemBase.setAttribute('y1', elbow.y);
  }
}

function SnooButtonFactory(app) {
  return app.mutate('core/components/snooButton', SnooButton);
}

export default SnooButtonFactory;