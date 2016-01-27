import React from 'react';
import TestUtils from 'react-addons-test-utils';
import buildProps from './buildProps';

export default function(extraProps, Component) {
  const props = Object.assign(buildProps(), extraProps);

  const renderer = TestUtils.createRenderer();
  renderer.render(<Component {...props} />);

  const instance = renderer._instance ? renderer._instance._instance : null;
  const result = renderer.getRenderOutput();

  return { renderer, instance, result };
}
