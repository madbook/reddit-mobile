import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import React from 'react/addons';
import shallowHelpers from 'react-shallow-renderer-helpers';

import Modal from '../../../src/views/components/Modal'

var TestUtils = React.addons.TestUtils;
var renderer = TestUtils.createRenderer();
var expect = chai.expect;

chai.use(sinonChai);


describe('Modal', () => {
  var instance;
  var el;
  var modal;
  var result;
  var button;

  beforeEach('render and find element', () => {
    renderer.render(
      <Modal open={true} >{'hello world'}</Modal>
    );

    instance = renderer._instance ? renderer._instance._instance : null;
    result = renderer.getRenderOutput();
    modal = shallowHelpers.findClass(result, 'modal');
  });

  it('open prop should be added to state', () => {
    expect(instance.state.open).to.equal(true);
  });

  it('should set the class "in" on modal when open is true', () => {
    expect(modal.props.className.indexOf('in')).to.not.equal(-1);
  });

  describe('closing', () => {
    
    beforeEach('closeModal method should set "state.open" to false', () => {
      instance.closeModal();

      result = renderer.getRenderOutput();
      modal = shallowHelpers.findClass(result, 'modal');
    })

    it('should set "state.open" to false when the button is clicked', () => {
      expect(instance.state.open).to.equal(false);
    });

    it('should not set "in" class on modal', () => {
      expect(modal.props.className.indexOf('in')).to.equal(-1);
    });

  });

});