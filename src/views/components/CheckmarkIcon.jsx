import React from 'react';
import SVGFactory from '../components/SVG';
var SVG;

const _SIZE = 20;

class CheckmarkIcon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this._open = this._open.bind(this);
    this._maskID = 'mask' + Math.random();
  }

  render() {
    return (
      <SVG width={_SIZE} height={_SIZE}>
        <defs>
          <clipPath id={this._maskID}>
            <rect ref='mask' x='0' y='0' width='0' height={_SIZE} fill='#000'/>
          </clipPath>
        </defs>
        <polyline ref='line' fill='none' stroke='#52AA19' strokeWidth='2' strokeMiterlimit='10' points='2.575379,10 7.525126,14.949747 17.424622,5.050252' clip-path={'url(#'+this._maskID+')'}/>
      </SVG>
    );
  }

  componentDidMount() {
    this.refs.line.getDOMNode().setAttribute('clip-path', 'url(#' + this._maskID + ')');
  }

  _open(opened) {
    TweenLite.to(this.refs.mask.getDOMNode(), 0.2, {attr: {width:opened?_SIZE:0}, ease:Linear.easeNone});
  }

  componentWillReceiveProps(nextProps) {
    var opened = nextProps.opened;
    if (typeof opened != 'undefined' && opened!=this.props.opened)
      this._open(opened);
  }
}

CheckmarkIcon.defaultProps = {
  opened:false,
};

function CheckmarkIconFactory(app) {
  SVG = SVGFactory(app);
  return app.mutate('core/components/CheckmarkIcon', CheckmarkIcon);
}

export default CheckmarkIconFactory;