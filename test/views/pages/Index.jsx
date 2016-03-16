/*eslint no-unused-expressions: 0 */
import chai from 'chai';
import sinonChai from 'sinon-chai';

import shallowHelpers from 'react-shallow-renderer-helpers';
import renderWithProps from '../../helpers/renderWithProps';

import { IndexPage, Loading, Listing } from '../../helpers/components';

const expect = chai.expect;
chai.use(sinonChai);

describe('index page', () => {
  let ctx;

  beforeEach('render and find element', () => {
    ctx = renderWithProps({
      ctx: { query: {} },
    }, IndexPage);
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
          listings: [{ }],
        },
      });
      ctx.result = ctx.renderer.getRenderOutput();
    });

    it('renders a ListingList copmonent when listings are loaded', () => {
      const listingContainer = shallowHelpers.findType(ctx.result, Listing);
      expect(listingContainer).to.not.equal(undefined);
    });
  });

  describe('Static methods', () => {
    describe('next/prev listings staleness', function() {
      it('before query with no before/after in response headers is stale', function() {
        const query = { before: 't3_abcd' };
        const listings = { body: [], headers: { }};

        expect(IndexPage.isStalePage(query, listings)).to.be.true;
      });

      it('after query with no before/after in response headers is stale', function() {
        const query = { after: 't3_abcd' };
        const listings = { body: [], headers: { }};

        expect(IndexPage.isStalePage(query, listings)).to.be.true;
      });

      it('after query with before in response headers with no listings is not stale', function() {
        const query = { after: 't3_abcd' };
        const listings = { body: [], headers: { before: 't3_efgh' }};

        expect(IndexPage.isStalePage(query, listings)).to.not.be.true;
      });
    });

    describe('next/prev listings stale redirect url', function() {
      it('returns a path without before, after, or page', function() {
        const path = '/r/science';
        const query = { before: 't3_abcd', after: 't3_efgh', page: 2 };

        const redirect = IndexPage.stalePageRedirectUrl(path, query);
        expect(redirect).to.equal('/r/science');
      });

      it('maintains non-paging querystrings', function() {
        const path = '/r/science';
        const query = { sort: 'hot', after: 't3_efgh', page: 2 };

        const redirect = IndexPage.stalePageRedirectUrl(path, query);
        expect(redirect).to.equal('/r/science?sort=hot');
      });
    });
  });
});
