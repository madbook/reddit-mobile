import React from 'react';
import globals from '../../globals';

class MobileButton extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hover: false,
    };

    this._over = this._over.bind(this);
    this._out = this._out.bind(this);
  }

  renderChildren() {
    return React.Children.map(this.props.children, function(child) {
      var type = child ? child.type : null;
      if (!type || typeof type === 'string') {
        return child;
      } else {
        return React.addons.cloneWithProps(child, {played: this.state.hover});
      }
    }.bind(this));
  }

  click() {
    // a no-op to prevent errors
  }

  render() {
    var move = this.props.move;
    var href = this.props.href;
    var click = this.props.onClick;
    var noRoute = this.props.noRoute || 'false';

    if (click) {
      noRoute = 'true';
    } else {
      click = this.click;
    }

    var props = Object.assign({}, this.props);

    delete props.className;
    delete props.move;
    delete props.over;
    delete props.out;

    if(globals().touch) {
      props.onTouchStart = this._over;
      props.onTouchEnd = this._out;
      if(move) {
        props.onTouchMove = move;
      }
    } else {
      props.onMouseEnter = this._over;
      props.onMouseLeave = this._out;
      if(move) {
        props.onMouseMove = move;
      }
    }
    var className = this.props.className;
    props.className = 'MobileButton' + (className ? (' ' + className) : '') + (this.state.hover ? ' hover' : '');

    if (href) {
      return (
        <a {...props} onClick={ click } data-no-route={ noRoute }>
          { this.renderChildren() }
        </a>
      );
    } else {
      return (
        <button type='button' {...props} onClick={ click }>
          { this.renderChildren() }
        </button>
      );
    }
  }

  _over(evt) {
    this.setState({hover: true});
    if (this.props.over) {
      this.props.over(evt);
    }
  }

  _out(evt) {
    this.setState({hover: false});
    if (this.props.out) {
      this.props.out(evt);
    }
  }
}

export default MobileButton;
