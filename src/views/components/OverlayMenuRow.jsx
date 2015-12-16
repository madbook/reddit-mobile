import React from 'react';

import BaseComponent from './BaseComponent';

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
      iconStyles.backgroundColor = props.iconBackgroundColor;
    }

    iconContent = <span className={ `OverlayMenu-icon ${props.icon}` } style={ iconStyles } />;
  }

  return (<span className='OverlayMenu-row-spacer'>{ iconContent }</span>);
}

class ButtonRow extends BaseComponent {
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

  static propTypes = {
    icon: React.PropTypes.string,
    iconURL: React.PropTypes.string,
    text: React.PropTypes.node.isRequired,
    clickHandler: React.PropTypes.func.isRequired,
  }
}

class LinkRow extends BaseComponent {
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

  static propTypes = {
    noRoute: React.PropTypes.bool,
    clickHandler: React.PropTypes.func,
    text: React.PropTypes.node.isRequired,
    href: React.PropTypes.string.isRequired,
    icon: React.PropTypes.string,
    iconURL: React.PropTypes.string,
  }
}

class ExpandoRow extends BaseComponent {
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
          <span className={ 'OverlayMenu-row-right-item' }>
            <span className={ `${expanded ? 'icon-nav-arrowup' : 'icon-nav-arrowdown'}` } />
          </span>
        </button>
        { body }
      </li>
    );
  }

  static propTypes = {
    text: React.PropTypes.string.isRequired,
    subtext: React.PropTypes.string,
    icon: React.PropTypes.string,
    iconURL: React.PropTypes.string,
  }
}

export default { ButtonRow, LinkRow, ExpandoRow };
