import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import shallowHelpers from 'react-shallow-renderer-helpers';
import renderWithProps from '../../helpers/renderWithProps';

import { Modal } from '../../helpers/components';

var expect = chai.expect;
chai.use(sinonChai);

describe('Modal', () => {
  var ctx;

  beforeEach('render and find element', () => {
    ctx = renderWithProps({open: true}, Modal);
  });

  it('open prop should be added to state', () => {
    expect(ctx.instance.state.open).to.equal(true);
  });

  it('should set the class "in" on modal when open is true', () => {
    let modal = shallowHelpers.findClass(ctx.result, 'modal');
    expect(modal.props.className.indexOf('in')).to.not.equal(-1);
  });

  describe('closing', () => {

    beforeEach('closeModal method should set "state.open" to false', () => {
      ctx.instance.closeModal();
      ctx.result = ctx.renderer.getRenderOutput();
    });

    it('should set "state.open" to false when the button is clicked', () => {
      expect(ctx.instance.state.open).to.equal(false);
    });

    it('should not set "in" class on modal', () => {
      let modal = shallowHelpers.findClass(ctx.result, 'modal');
      expect(modal.props.className.indexOf('in')).to.equal(-1);
    });

  });

});
