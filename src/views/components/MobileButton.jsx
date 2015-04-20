import React from 'react/addons';
import Utils from '../../lib/danehansen/Utils';

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
      var type = child.type;
      if (!type || typeof type === 'string') {
        return child;
      } else {
        return React.addons.cloneWithProps(child, {played: this.state.hover});
      }
    }.bind(this));
  }

  render() {
    var move = this.props.move;
    var href = this.props.href;
    if (href) {
      return (
        <a
          className={this.props.className + (this.state.hover ? ' hover' : '')}
          onClick={this.props.onClick}
          onMouseEnter={this._touch ? null : this._over}
          onMouseLeave={this._touch ? null : this._out}
          onMouseMove={move}
          onTouchMove={move}
          onTouchStart={this._touch ? this._over : null}
          onTouchEnd={this._touch ? this._out : null}
          href={href}>
          { this.renderChildren() }
        </a>
      );
    } else {
      return (
        <button
          className={this.props.className + (this.state.hover ? ' hover' : '')}
          onClick={this.props.onClick}
          onMouseEnter={this._touch ? null : this._over}
          onMouseLeave={this._touch ? null : this._out}
          onMouseMove={move}
          onTouchMove={move}
          onTouchStart={this._touch ? this._over : null}
          onTouchEnd={this._touch ? this._out : null}
          type={this.props.type}>
          { this.renderChildren() }
        </button>
      );
    }
  }

  componentDidMount() {
    this._touch = Utils.touch();
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

function MobileButtonFactory(app) {
  return app.mutate('core/components/MobileButton', MobileButton);
}

export default MobileButtonFactory;
