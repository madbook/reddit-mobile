import React from 'react';

import BaseComponent from './BaseComponent';

const T = React.PropTypes;

const BaseRowProps = {
  text: T.node.isRequired,
  icon: T.string,
  iconURL: T.string,
  theme: T.string,
};

function iconOrSpacerFromProps(props) {
  if (props.subtext) {
    return false;
  }

  let iconContent;

  if (props.iconURL) {
    const backgroundStyle = {
      backgroundImage: `url(${props.iconURL})`,
    };

    if (props.iconBackgroundColor) {
      if (props.theme === 'nightmode') {
        backgroundStyle.borderColor = props.iconBackgroundColor;
      }

      backgroundStyle.backgroundColor = props.iconBackgroundColor;
    }

    iconContent = (
      <span
        className='OverlayMenu-icon OverlayMenu-icon-img'
        style={ backgroundStyle }
      />);
  } else if (props.icon) {
    const iconStyles = {};

    if (props.iconBackgroundColor) {
      if (props.theme === 'nightmode') {
        iconStyles.borderColor = props.iconBackgroundColor;
      } else {
        iconStyles.backgroundColor = props.iconBackgroundColor;
      }
    }

    iconContent = <span className={ `OverlayMenu-icon ${props.icon}` } style={ iconStyles } />;
  }

  return (<span className='OverlayMenu-row-spacer'>{ iconContent }</span>);
}

class ButtonRow extends BaseComponent {
  static propTypes = {
    ...BaseRowProps,
    clickHandler: T.func.isRequired,
  };

  render() {
    return (
      <li className='OverlayMenu-row'>
        <button
          type='button'
          className='OverlayMenu-row-button'
          onClick={ this.props.clickHandler }
        >
          { iconOrSpacerFromProps(this.props) }
          <span className='OverlayMenu-row-text'>{ this.props.text }</span>
        </button>
        { this.props.children }
      </li>
    );
  }
}

class LinkRow extends BaseComponent {
  static propTypes = {
    ...BaseRowProps,
    href: T.string.isRequired,
    noRoute: T.bool,
    clickHandler: T.func,
  };

  render() {
    return (
      <li className='OverlayMenu-row'>
        <a
          className='OverlayMenu-row-button' href={ this.props.href }
          data-no-route={ this.props.noRoute }
          onClick={ this.props.clickHandler }
        >
          { iconOrSpacerFromProps(this.props) }
          <span className='OverlayMenu-row-text'>{ this.props.text }</span>
        </a>
        { this.props.children }
      </li>
    );
  }
}

class ExpandoRow extends BaseComponent {
  static propTypes = {
    ...BaseRowProps,
    subtext: T.string,
  };

  constructor(props) {
    super(props);

    this.state.expanded = false;

    this._onClick = this._onClick.bind(this);
  }

  _onClick() {
    const newExpanded = !this.state.expanded;
    this.setState({ expanded: newExpanded });
  }

  render() {
    const props = this.props;
    const expanded = this.state.expanded;

    let body;
    if (expanded) {
      body = (
        <ul className='OverlayMenu-ul list-unstyled'>
          { this.props.children }
        </ul>
      );
    }

    let rowText;
    if (props.subtext) {
      rowText = (
        <span className='OverlayMenu-row-text with-subtext'>
          { props.text }
          <br />
          <span className='OverlayMenu-row-text subtext'>{ props.subtext }</span>
        </span>
      );
    } else {
      rowText = <span className='OverlayMenu-row-text'>{ props.text }</span>;
    }

    return (
      <li className='OverlayMenu-row top-border'>
        <button type='button' className='OverlayMenu-row-button' onClick={ this._onClick }>
          { iconOrSpacerFromProps(props) }
          { rowText }
          <span className='OverlayMenu-row-right-item'>
            <span className={ `${expanded ? 'icon-nav-arrowup' : 'icon-nav-arrowdown'}` } />
          </span>
        </button>
        { body }
      </li>
    );
  }
}

export { ButtonRow, LinkRow, ExpandoRow };
