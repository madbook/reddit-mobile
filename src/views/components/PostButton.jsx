import React from 'react';

const _X_LEFT = 5.08719;
const _X_RIGHT = 14.912809;
const _X_TOP = 16.087191;
const _X_BOTTOM = 25.912809;

class PostButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
    this._onMouseEnter = this._onMouseEnter.bind(this);
    this._onMouseLeave = this._onMouseLeave.bind(this);
  }

  render() {
    return (
      <button className='PostButton' onMouseEnter={this._onMouseEnter} onMouseLeave={this._onMouseLeave} onTouchStart={this._onMouseEnter} onTouchEnd={this._onMouseLeave}>
        <svg version='1.1' xmlns='http://www.w3.org/2000/svg' x='0px' y='0px' width='31px' height='31px' viewBox='0 0 31 31'>
          <path fill='none' stroke='#fff' strokeWidth='2' d='M16,30H3.999687C2.343006,30,1,28.656994,1,27.000313V15c0-1.656855,1.343146-3,3-3h12.000313 C17.656994,12,19,13.343006,19,14.999687V27C19,28.656855,17.656855,30,16,30z'/>
          <g fill='none' stroke='#fff' strokeWidth='2' strokeLinejoin='round'>
            <line ref='x1' x1={_X_LEFT} y1={_X_BOTTOM} x2={_X_LEFT} y2={_X_BOTTOM}/>
            <line ref='x2' x1={_X_LEFT} y1={_X_TOP} x2={_X_LEFT} y2={_X_TOP}/>
          </g>
          <g ref='pencil'>
            <path fill='#fff' d='M11.859481,23.920959l-6.772291,1.99185l1.99185-6.772289l9.549257-9.549258 c0.713877-0.713877,1.87553-0.713877,2.589405,0l2.191036,2.191034c0.713875,0.713877,0.713875,1.875529,0,2.589406 L11.859481,23.920959z'/>
            <path fill='#106b90' d='M17.62425,10.587197c0.16501-0.16501,0.432543-0.165011,0.597555,0l2.191034,2.191035 c0.165012,0.165011,0.16501,0.432545,0,0.597555l-0.896332,0.896333l-2.788591-2.78859L17.62425,10.587197 M15.731992,12.479455 l2.78859,2.78859l-6.77229,6.772289l-2.78859-2.788589L15.731992,12.479455 M8.162962,20.446856l2.39022,2.390221L7.167037,23.833 L8.162962,20.446856 M5.829183,18.398563l-2.82178,9.59407l9.59407-2.821779l9.900673-9.904946 c1.164682-1.269361,1.132223-3.249847-0.097456-4.479526l-2.191034-2.191035 c-1.229679-1.229678-3.210165-1.262138-4.479527-0.097455l-0.002137-0.002137L5.829183,18.398563z'/>
          </g>
        </svg>
      </button>
    );
  }

  componentDidMount() {
    var pencil = this.refs.pencil.getDOMNode();
    var xDiff = _X_RIGHT - _X_LEFT;
    var yDiff = _X_BOTTOM - _X_TOP;
    this._timeline = new TimelineLite({paused:true});
    this._timeline.add(TweenLite.to(pencil, 0.1, {x:xDiff, y:-yDiff}));
    this._timeline.add(TweenLite.to(this.refs.x1.getDOMNode(), 0.1, {attr:{x2:_X_RIGHT, y2:_X_TOP}}),0);
    this._timeline.add(TweenLite.to(pencil, 0.1, {x:0}));
    this._timeline.add(TweenLite.to(pencil, 0.1, {x:xDiff, y:0}));
    this._timeline.add(TweenLite.to(this.refs.x2.getDOMNode(), 0.1, {attr:{x2:_X_RIGHT, y2:_X_BOTTOM}}),0.2);
  }

  _onMouseEnter() {
    this._timeline.play();
  }

  _onMouseLeave() {
    this._timeline.reverse();
  }
}

function PostButtonFactory(app) {
  return app.mutate('core/components/postButton', PostButton);
}

export default PostButtonFactory;