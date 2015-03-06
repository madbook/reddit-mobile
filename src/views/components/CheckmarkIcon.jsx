import React from 'react';

const _SIZE = 18;

class CheckmarkIcon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };

    this._checked = false;
    this._maskID = 'mask' + Math.random();
  }

  render() {
    return (
      <svg version='1.1' xmlns='http://www.w3.org/2000/svg' x='0px' y='0px' width={_SIZE+'px'} height={_SIZE+'px'} viewBox={'0 0 '+_SIZE+' '+_SIZE}>
         <defs>
          <clipPath id={this._maskID}>
            <rect ref='mask' x='0' y='0' width='0' height={_SIZE} fill='#000'/>
          </clipPath>
        </defs>
        <polyline ref='line' fill='none' stroke='#52AA19' strokeWidth='2' strokeMiterlimit='10' points='1.575379,9 6.525126,13.949747 16.424622,4.050252' clip-path={'url(#'+this._maskID+')'}/>
      </svg>
    );
  }

  componentDidMount() {
    this.refs.line.getDOMNode().setAttribute('clip-path', 'url(#' + this._maskID + ')');
    this._check(this.props.checked)
  }

  _check(checked) {
    if (checked != this._checked)
    {
      TweenLite.to(this.refs.mask.getDOMNode(), 0.2, {attr: {width:checked?_SIZE:0}, ease:Linear.easeNone});
      this._checked = checked;
    }
  }

  componentWillReceiveProps(nextProps) {
    var checked = nextProps.checked;
    if (typeof checked != 'undefined')
      this._check(checked);
  }
}

CheckmarkIcon.defaultProps = {
  checked:false
};

function CheckmarkIconFactory(app) {
  return app.mutate('core/components/snooButton', CheckmarkIcon);
}

export default CheckmarkIconFactory;