import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import React from 'react/addons';
var { TestUtils } = React.addons;

import shallowHelpers from 'react-shallow-renderer-helpers';
import renderWithProps from '../../helpers/renderWithProps';

import { IndexPage, Loading, TopSubNav } from '../../helpers/components';

var expect = chai.expect;
chai.use(sinonChai);

describe('index page', () => {
  var ctx;

  beforeEach('render and find element', () => {
    ctx = renderWithProps({}, IndexPage);
  });

  it('is a thing', () => {
    expect(ctx.instance);
  });

  it('displays loading component when data or data listings are not defined', () => {
    expect(ctx.result.type).to.equal(Loading);
  });

  describe('With data', () => {
    beforeEach('render and find element', () => {

      ctx.instance.setState({
        data: {
          listings: []
        }
      });
      ctx.result = ctx.renderer.getRenderOutput();
    });

    it('renders a ListingList copmonent when listings are loaded', () => {
      let listingContainer = shallowHelpers.findClass(ctx.result, 'Listing-container');
      expect(listingContainer).to.not.equal(undefined);
    })

  });

});

