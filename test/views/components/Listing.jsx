import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import shallowHelpers from 'react-shallow-renderer-helpers';
import renderWithProps from '../../helpers/renderWithProps';

import { Listing } from '../../helpers/components';

var expect = chai.expect;
chai.use(sinonChai);

describe('Listing component', () => {
  var ctx;

  beforeEach('render and find element', () => {
    ctx = renderWithProps({open: true}, Listing);
  });
});