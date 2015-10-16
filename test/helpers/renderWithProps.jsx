import React from 'react/addons';
import buildProps from './buildProps';

var TestUtils = React.addons.TestUtils;

export default function(extraProps, Component) {
  var props = Object.assign(buildProps(), extraProps);

  var renderer = TestUtils.createRenderer();
  renderer.render(<Component {...props} />);

  var instance = renderer._instance ? renderer._instance._instance : null;
  var result = renderer.getRenderOutput();

  return { renderer, instance, result };
}
