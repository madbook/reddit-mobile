import chai from 'chai';
import sinonChai from 'sinon-chai';

import findText from '../../helpers/findtext';
import renderWithProps from '../../helpers/renderWithProps';

import { Modal } from '../../helpers/components';

const expect = chai.expect;
chai.use(sinonChai);

describe('Modal', () => {
  let ctx;

  const childText = 'hello world';

  beforeEach('render and find element', () => {
    const props = {
      children: childText,
      close: () => {},
    };
    ctx = renderWithProps(props, Modal);
  });

  it('Should exist', () => {
    expect(Modal);
  });

  it('should render and children', () => {
    expect(findText(ctx.result, childText));
  });
});
