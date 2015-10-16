import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import shallowHelpers from 'react-shallow-renderer-helpers';
import renderWithProps from '../../helpers/renderWithProps';

import { BodyLayout } from '../../helpers/components';

var expect = chai.expect;
chai.use(sinonChai);

describe('BodyLayout', () => {
  var ctx;

  before('render and find element', () => {
    ctx = renderWithProps({children: 'hello world'}, BodyLayout);
  });

  it('should render children inside "main" element', () => {
    let main = shallowHelpers.findType(ctx.result, 'main');
    expect(main.props.children).to.equal('hello world');
  });

});
