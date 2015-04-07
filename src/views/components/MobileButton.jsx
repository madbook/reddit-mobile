import React from 'react';

class MobileButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    var over = this.props.over;
    var out = this.props.out;
    var move = this.props.move;
    var href = this.props.href;
    if (href) {
      return (
        <a
          className={this.props.className}
          onClick={this.props.onClick}
          onMouseEnter={over}
          onMouseLeave={out}
          onMouseMove={move}
          onTouchMove={move}
          onTouchStart={over}
          onTouchEnd={out}
          href={href}>
          { this.props.children }
        </a>
      );
    } else {
      return (
        <button
          className={this.props.className}
          onClick={this.props.onClick}
          onMouseEnter={over}
          onMouseLeave={out}
          onMouseMove={move}
          onTouchMove={move}
          onTouchStart={over}
          onTouchEnd={out}
          type={this.props.type}>
          { this.props.children }
        </button>
      );
    }
  }
}

function MobileButtonFactory(app) {
  return app.mutate('core/components/MobileButton', MobileButton);
}

export default MobileButtonFactory;
