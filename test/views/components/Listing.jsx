/*eslint no-unused-vars: 0 */
// TODO: add tests here
import chai from 'chai';
import sinonChai from 'sinon-chai';

import renderWithProps from '../../helpers/renderWithProps';

import { Listing } from '../../helpers/components';

const expect = chai.expect;
chai.use(sinonChai);

describe('Listing component', () => {
  let ctx;

  beforeEach('render and find element', () => {
    ctx = renderWithProps({open: true}, Listing);
  });
});
