import React from 'react';

import constants from '../../../constants';

const T = React.PropTypes;
const MARGIN_BUFFER = 8; // match less' @grid-size
const MAX_WIDTH = 420; // match max-width in less
const ARROW_HEIGHT = 10;

function shouldRenderAbove(target) {
  const { top, bottom } = target.getBoundingClientRect();
  const windowHeight = window.innerHeight;
  const midpoint = windowHeight / 2;
  const targetMidpoint = (top + bottom) / 2;
  return targetMidpoint > midpoint;
}

function computeFloat(target) {
  const targetBounds = target.getBoundingClientRect();
  const targetLeft = targetBounds.left;
  const targetWidth = targetBounds.width;
  const targetMidpoint = targetLeft + (targetWidth / 2);
  const windowWidth = window.innerWidth;
  
  if (targetMidpoint < (MAX_WIDTH / 2)) {
    return { left: MARGIN_BUFFER };
  } else if ((windowWidth - targetMidpoint) < (MAX_WIDTH / 2)) {
    return { right: MARGIN_BUFFER };
  }
  
  // if we're at this point, it is safe to assume that the dropdown will assume
  // the MAX_WIDTH
  return {
    left: targetMidpoint,
    marginLeft: -(MAX_WIDTH / 2),
  };
}

function computeContentStyles(target, offset) {
  const targetBounds = target.getBoundingClientRect();
  const targetTop = targetBounds.top;
  const targetBottom = targetBounds.bottom;
  const targetHeight = targetBounds.height;
  const targetLeft = targetBounds.left;
  const targetWidth = targetBounds.width;
  const windowHeight = window.innerHeight;
  const windowWidth = window.innerWidth;
  
  const arrowStyle = {
    position: 'fixed',
    left: targetLeft + (targetWidth / 2),
  };
  
  const wrapperStyle = {
    ...computeFloat(target),
    width: windowWidth - (2 * MARGIN_BUFFER),
  };
  
  const contentStyle = {};
  
  if (shouldRenderAbove(target)) {
    wrapperStyle.bottom = windowHeight - targetBottom + targetHeight + offset;
    contentStyle.maxHeight = targetTop - MARGIN_BUFFER;
    arrowStyle.top = targetTop - offset;
  } else {
    wrapperStyle.top = targetBottom + offset;
    contentStyle.maxHeight = windowHeight - targetBottom - MARGIN_BUFFER;
    arrowStyle.top = targetBottom + offset - ARROW_HEIGHT;
  }
  
  return { arrowStyle, wrapperStyle, contentStyle };
}

export default class DropdownController extends React.Component {
  static propTypes = {
    target: T.object.isRequired,
    app: T.object.isRequired,
    offset: T.number,
    onClose: T.func,
  };
  
  static defaultProps = {
    offset: 0,
    onClose: () => {},
  };
  
  constructor(props) {
    super(props);
    
    this.bodyOverflow = document.body.style.overflow;
    this.handleClose = this.handleClose.bind(this);
  }
  
  handleClose(e) {
    e.stopPropagation();
    e.preventDefault();
    this.props.onClose();
  }
  
  componentDidMount() {
    this.props.app.emit(constants.OVERLAY_MENU_OPEN, true);
  }
  
  componentWillUnmount() {
    this.props.app.emit(constants.OVERLAY_MENU_OPEN, false);
  }
  
  render() {
    return (
      <div className='DropdownController'>
        { this.renderOverlay() }
        { this.renderContent() }
      </div>
    );
  }
  
  renderOverlay() {
    return (
      <div
        className='DropdownController__overlay'
        onClick={ this.handleClose }
      />
    );
  }
  
  renderContent() {
    const { children, target, offset } = this.props;
    const { wrapperStyle, contentStyle, arrowStyle } = computeContentStyles(target, offset);
    
    return (
      <div className='DropdownController__contentWrapper' style={ wrapperStyle }>
        <div className='DropdownController__content' style={ contentStyle }>{ children }</div>
        { this.renderArrow(arrowStyle) }
      </div>
    );
  }
  
  renderArrow(style) {
    const { target } = this.props;
    const renderAbove = shouldRenderAbove(target);
    const arrowCls = renderAbove ? 'stalactite' : 'stalagmite';
    
    return (
      <div className={ arrowCls } style={ style }/>
    );
  }
}
