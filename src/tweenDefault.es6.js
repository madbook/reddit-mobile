import Utils from './lib/danehansen/utils/Utils';

const _DURATION = 0.4;

function _changeProp(style, prop, dest) {
  style[prop] = dest;
}

function _to(node, dest, prop, dimention, autoVal, clearProp = true, ease = Cubic.easeInOut) {
  var auto = dest === autoVal;
  var style = node.style;
  var current = node[dimention];
  if (auto) {
    style[prop] = autoVal;
    dest = parseFloat(node[dimention]);
  }
  style[prop] = current;
  var obj = {ease: ease};
  obj[prop] = dest;
  if (clearProp) {
    obj.clearProps = prop;
  } else if (auto) {
    obj.onComplete = _changeProp.bind(this, style, prop, autoVal);
  }
  TweenLite.to(node, _DURATION, obj);
}

export default {
  width: function(node, dest, clearProp, ease) {
    _to(node, dest, 'width', 'offsetWidth', 'auto', clearProp, ease);
  },
  height: function(node, dest, clearProp, ease) {
    _to(node, dest, 'height', 'offsetHeight', 'auto', clearProp, ease);
  },
  maxWidth: function(node, dest, clearProp, ease) {
    _to(node, dest, 'maxWidth', 'offsetWidth', 'none', clearProp, ease);
  },
  maxHeight: function(node, dest, clearProp, ease) {
    _to(node, dest, 'maxHeight', 'offsetHeight', 'none', clearProp, ease);
  }
};
