import React from 'react';
import SVGFactory from '../../components/SVG';
var SVG;

class MailIcon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this._play = this._play.bind(this);
    this._flipFlop = this._flipFlop.bind(this);
    this._flipFlopped = false;
  }

  render() {
    return (
      <SVG className='SVG-icon MailIcon' width={20} height={20} fallbackIcon='icon-mail-circled'>
        <circle className='SVG-fill' cx='10' cy='10' r='10'/>
        <rect x='4.166667' y='6.666667' className='SVG-fill-bg' width='11.666667' height='7.5'/>
        <g ref='page'>
          <rect x='5.266667' y='7.453' className='SVG-fill-bg SVG-stroke' strokeWidth='0.5' width='9.466666' height='7.213541'/>
          <g className='SVG-stroke' strokeWidth='0.4'>
            <line x1='13.7' y1='9.452767' x2='6.3' y2='9.452767'/>
            <line x1='13.7' y1='10.518393' x2='6.3' y2='10.518393'/>
            <line x1='13.7' y1='11.584017' x2='6.3' y2='11.584017'/>
            <line x1='13.7' y1='12.649642' x2='6.3' y2='12.649642'/>
            <line x1='13.7' y1='13.715267' x2='6.3' y2='13.715267'/>
          </g>
        </g>
        <g>
          <polygon className='SVG-fill-bg' points='12.083008,10.416504 16.083008,6.416504 16.083008,14.416992'/>
          <path className='SVG-fill' d='M15.833331,7.020166v6.79298l-3.396521-3.39652L15.833331,7.020166 M16.33333,5.813076l-0.853549,0.85353 l-3.396521,3.39646l-0.353559,0.35356l0.353559,0.35355l3.396521,3.39652l0.853549,0.853559v-1.207109v-6.79298V5.813076 L16.33333,5.813076z'/>
        </g>
        <g>
          <polygon className='SVG-fill-bg' points='3.916504,6.416504 7.916504,10.416504 3.916504,14.416992'/>
          <path className='SVG-fill' d='M4.166669,7.020166l3.39652,3.396461l-3.39652,3.39652V7.020166 M3.666669,5.813076v1.20709v6.79298v1.207109 l0.85355-0.853559l3.39652-3.39652l0.35356-0.35355l-0.35356-0.35356l-3.39652-3.39646L3.666669,5.813076L3.666669,5.813076z'/>
        </g>
        <g>
          <path className='SVG-fill-bg' d='M3.916504,14.416992L8.0625,10.270996c0.514648-0.514648,1.19873-0.797852,1.92627-0.797852 c0.750488,0,1.435059,0.283203,1.94873,0.797852l4.145508,4.145996H3.916504z'/>
          <path className='SVG-fill' d='M10.01139,9.723146c0.66081,0,1.28223,0.2574,1.74952,0.724689l3.71889,3.71883H4.5202l3.71889-3.71883 c0.46729-0.46729,1.08871-0.724689,1.74952-0.724689H10.01139 M10.01139,9.223146H9.98861 c-0.794431,0-1.54131,0.30938-2.10307,0.87114l-3.71889,3.718821l-0.85357,0.853559H4.5202h10.9596h1.20712l-0.85357-0.853559 l-3.71889-3.71883C11.5527,9.532526,10.80582,9.223146,10.01139,9.223146L10.01139,9.223146z'/>
        </g>
        <g ref='flap'>
          <path className='SVG-fill-bg' d='M9.988606,11.110188h0.022787c0.660807,0,1.282227-0.257405,1.749512-0.72469l3.718892-3.718832H4.520203 l3.718892,3.718832C8.70638,10.852783,9.3278,11.110188,9.988606,11.110188z'/>
          <path className='SVG-fill' d='M15.479797,6.666626l-3.718872,3.718872c-0.467285,0.467285-1.088745,0.72467-1.749512,0.72467H9.988586 c-0.660767,0-1.282227-0.257385-1.749512-0.72467L4.520203,6.666626H3.813049l0.353577,0.353577l3.718933,3.718811 c0.561768,0.561768,1.308594,0.871155,2.103027,0.871155c0.817261,0,1.564087-0.309387,2.125854-0.871155l3.718933-3.718811 l0.353577-0.353577H15.479797z'/>
        </g>
      </SVG>
    );
  }

  componentDidMount() {
    if (!SVG.ENABLED) {
      return;
    }
    this._timeline = new TimelineLite({paused: true});
    this._timeline.add(TweenLite.to(this.refs.flap.getDOMNode(), 0.2, {rotationX: 180, transformOrigin:"50% 0%", ease: Cubic.easeInOut}));
    this._timeline.call(this._flipFlop.bind(this));
    this._timeline.add(TweenLite.to(this.refs.page.getDOMNode(), 0.2, {y: '-50%', ease: Cubic.easeInOut}));
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

  _flipFlop() {
    var flap = this.refs.flap.getDOMNode();
    var svg = React.findDOMNode(this);
    if (this._flipFlopped) {
      svg.appendChild(flap);
    } else {
      var page = this.refs.page.getDOMNode();
      svg.insertBefore(flap, page);
    }
    this._flipFlopped = !this._flipFlopped;
  }
}

MailIcon.defaultProps = {
  played: false,
};

function MailIconFactory(app) {
  SVG = SVGFactory(app);
  return app.mutate('core/components/icons/MailIcon', MailIcon);
}

export default MailIconFactory;
