import React from 'react';
import BaseComponent from './BaseComponent';

const _DURATION = 0.4;

function _changeProp(style, prop, dest, onComplete) {
  style[prop] = dest;
  if (onComplete) {
    onComplete();
  }
}

function _tween(node, dest, prop, dimention, autoVal, to, onComplete = null, clearProp = true, ease = Cubic.easeInOut) {
  var auto = dest === autoVal;
  var style = node.style;
  var current = node[dimention];
  if (auto && to) {
    style[prop] = autoVal;
    dest = parseFloat(node[dimention]);
  }
  style[prop] = current;
  var obj = {ease: ease};
  obj[prop] = dest;
  if (clearProp) {
    obj.clearProps = prop;
  }
  if (auto && !clearProp) {
    obj.onComplete = _changeProp.bind(this, style, prop, autoVal, onComplete);
  } else if (onComplete) {
    obj.onComplete = onComplete;
  }
  if (to) {
    TweenLite.to(node, _DURATION, obj);
  } else {
    TweenLite.from(node, _DURATION, obj);
  }
}

//instances of this component must be placed within a TransitionGroup in order to work

class AutoTween extends BaseComponent {
  constructor(props) {
    super(props);

    this.state = {
      tweening: false,
    };
  }

  render() {
    var className = this.props.className;
    var options = {
      className: 'AutoTween' + (this.state.tweening ? ' tweening' : '') + (className ? (' ' + className) : ''),
      ref: 'all',
    };
    return React.createElement(this.props.component || 'div', options, this.props.children);
  }

  componentWillEnter(callback) {
    AutoTween.heightFrom(this.refs.all.getDOMNode(), 0, callback);
    this.setState({tweening: true});
  }

  componentDidEnter() {
    this.setState({tweening: false});
  }

  componentWillLeave(callback) {
    AutoTween.height(this.refs.all.getDOMNode(), 0, callback);
    this.setState({tweening: true});
  }
}

AutoTween.width = function(node, dest, onComplete, clearProp, ease) {
  _tween(node, dest, 'width', 'offsetWidth', 'auto', true, onComplete, clearProp, ease);
};

AutoTween.height = function(node, dest, onComplete, clearProp, ease) {
  _tween(node, dest, 'height', 'offsetHeight', 'auto', true, onComplete, clearProp, ease);
};

AutoTween.maxWidth = function(node, dest, onComplete, clearProp, ease) {
  _tween(node, dest, 'maxWidth', 'offsetWidth', 'none', true, onComplete, clearProp, ease);
};

AutoTween.maxHeight = function(node, dest, onComplete, clearProp, ease) {
  _tween(node, dest, 'maxHeight', 'offsetHeight', 'none', true, onComplete, clearProp, ease);
};

AutoTween.widthFrom = function(node, dest, onComplete, clearProp, ease) {
  _tween(node, dest, 'width', 'offsetWidth', 'auto', false, onComplete, clearProp, ease);
};

AutoTween.heightFrom = function(node, dest, onComplete, clearProp, ease) {
  _tween(node, dest, 'height', 'offsetHeight', 'auto', false, onComplete, clearProp, ease);
};

AutoTween.maxWidthFrom = function(node, dest, onComplete, clearProp, ease) {
  _tween(node, dest, 'maxWidth', 'offsetWidth', 'none', false, onComplete, clearProp, ease);
};

AutoTween.maxHeightFrom = function(node, dest, onComplete, clearProp, ease) {
  _tween(node, dest, 'maxHeight', 'offsetHeight', 'none', false, onComplete, clearProp, ease);
};

AutoTween.propTypes = {
  className: React.PropTypes.string,
  component: React.PropTypes.string,
};

export default AutoTween;
