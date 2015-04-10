import React from 'react';
import SVGFactory from '../../components/SVG';
var SVG;

const _X_LEFT = 5.08719;
const _X_RIGHT = 14.912809;

class PostIcon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this._play = this._play.bind(this);
  }

  render() {
    return (
      <SVG width={SVG.ICON_SIZE} height={SVG.ICON_SIZE} fallbackIcon='icon-post-circled'>
        <path fill='none' className='SVG-stroke' strokeWidth='2' d='M16,18.999926H3.999687C2.343006,18.999926,1,17.656919,1,16.000238V3.999926c0-1.656855,1.343146-3,3-3 h12.000313C17.656994,0.999926,19,2.342932,19,3.999614v12.000313C19,17.65678,17.656855,18.999926,16,18.999926z'/>
        <g fill='none' className='SVG-stroke' strokeWidth='2' strokeLinejoin='round'>
          <line ref='x1' x1={_X_LEFT} y1={_X_RIGHT} x2={_X_LEFT} y2={_X_RIGHT}/>
          <line ref='x2' x1={_X_LEFT} y1={_X_LEFT} x2={_X_LEFT} y2={_X_LEFT}/>
        </g>
        <g ref='pencil'>
          <path className='SVG-fill' d='M11.859481,12.920886l-6.772291,1.99185l1.99185-6.772289l9.549256-9.549258 c0.713877-0.713877,1.87553-0.713877,2.589405,0l2.191036,2.191034c0.713875,0.713877,0.713875,1.875529,0,2.589406 L11.859481,12.920886z'/>
          <path className='SVG-fill-bg' d='M17.62425-0.412876c0.16501-0.16501,0.432543-0.165011,0.597555,0l2.191034,2.191035 c0.165012,0.165011,0.16501,0.432545,0,0.597555l-0.896332,0.896333l-2.788591-2.78859L17.62425-0.412876 M15.731992,1.479381 l2.78859,2.788591l-6.77229,6.772289l-2.78859-2.788589L15.731992,1.479381 M8.162962,9.446782l2.39022,2.390221 l-3.386145,0.995924L8.162962,9.446782 M5.829183,7.39849l-2.82178,9.594069l9.59407-2.821778l9.900674-9.904946 c1.164682-1.269361,1.132223-3.249847-0.097456-4.479526l-2.191034-2.191035 c-1.229679-1.229678-3.210165-1.262138-4.479527-0.097455l-0.002137-0.002137L5.829183,7.39849z'/>
        </g>
      </SVG>
    );
  }

  componentDidMount() {
    if (!SVG.ENABLED) {
      return;
    }
    var pencil = this.refs.pencil.getDOMNode();
    var diff = _X_RIGHT - _X_LEFT;
    this._timeline = new TimelineLite({paused: true});
    this._timeline.add(TweenLite.to(pencil, 0.1, {x: diff, y: -diff}));
    this._timeline.add(TweenLite.to(this.refs.x1.getDOMNode(), 0.1, {attr: {x2: _X_RIGHT, y2: _X_LEFT}}), 0);
    this._timeline.add(TweenLite.to(pencil, 0.1, {x: 0}));
    this._timeline.add(TweenLite.to(pencil, 0.1, {x: diff, y: 0}));
    this._timeline.add(TweenLite.to(this.refs.x2.getDOMNode(), 0.1, {attr: {x2: _X_RIGHT, y2: _X_RIGHT}}), 0.2);
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

  _play(bool) {
    if (bool) {
      this._timeline.play();
    } else {
      this._timeline.reverse();
    }
  }
}

PostIcon.defaultProps = {
  played: false,
};

function PostIconFactory(app) {
  SVG = SVGFactory(app);
  return app.mutate('core/components/icons/PostIcon', PostIcon);
}

export default PostIconFactory;
