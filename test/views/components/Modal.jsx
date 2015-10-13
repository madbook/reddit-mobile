import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import React from 'react/addons';
import Modal from '../../../src/views/components/Modal'

var TestUtils = React.addons.TestUtils;
var expect = chai.expect;

chai.use(sinonChai);


describe('Modal', () => {
  var component;
  var el;
  var modal;
  var button;

  before('render and find element', () => {
    component = TestUtils.renderIntoDocument(
      <Modal open={true} >{'hello world'}</Modal>
    );

    el = React.findDOMNode(component);
    modal = el.querySelector('.modal');
    button = el.querySelector('.close');
  });

  it('open prop should be added to state', () => {
    expect(component.state.open).to.equal(true);
  });

  it('should set the class "in" on modal when open is true', () => {
    expect(modal.className.indexOf('in')).to.not.equal(-1);
  });

  describe('closing', () => {
    
    before('Click the button', () => {
      TestUtils.Simulate.click(button);
    })

    it('should set "state.open" to false when the button is clicked', () => {
      expect(component.state.open).to.equal(false);
    });

    it('should not set "in" class on modal', () => {
      expect(modal.className.indexOf('in')).to.equal(-1);
    });

  });

});