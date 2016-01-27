import chai from 'chai';
import sinonChai from 'sinon-chai';

import shallowHelpers from 'react-shallow-renderer-helpers';
import renderWithProps from '../../helpers/renderWithProps';

import { BodyLayout } from '../../helpers/components';

const expect = chai.expect;
chai.use(sinonChai);

describe('BodyLayout', () => {
  let ctx;

  before('render and find element', () => {
    ctx = renderWithProps({children: 'hello world'}, BodyLayout);
  });

  it('should render children inside "main" element', () => {
    const main = shallowHelpers.findType(ctx.result, 'main');
    expect(main.props.children).to.equal('hello world');
  });

});
