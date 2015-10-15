import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import React from 'react/addons';
import shallowHelpers from 'react-shallow-renderer-helpers';

import BodyLayout from '../../../src/views/layouts/BodyLayout'


var TestUtils = React.addons.TestUtils;
var renderer = TestUtils.createRenderer();
var expect = chai.expect;


chai.use(sinonChai);

describe('BodyLayout', () => {
  var instance;
  var result;

  before('render and find element', () => {

    var props = {};
    props.data = new Map();
    props.dataCache = {};
    props.ctx = {};
    props.app = {};
    props.children='hello world';

    renderer.render(<BodyLayout {...props} ></BodyLayout>);

    // Next react version will expose a method to get the instance.
    instance = renderer._instance ? renderer._instance._instance : null;
    result = renderer.getRenderOutput();
  });

  it('should render children inside "main" element', () => {
    let main = shallowHelpers.findType(result, 'main');
    expect(main.props.children).to.equal('hello world');
  });

});
