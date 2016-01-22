import chai from 'chai';
import sinonChai from 'sinon-chai';

import findText from '../../helpers/findtext';
import renderWithProps from '../../helpers/renderWithProps';

import { WikiPage, Loading } from '../../helpers/components';
import { MESSAGES } from '../../../src/views/pages/wikipage';

const expect = chai.expect;
chai.use(sinonChai);

describe('WikiPage', () => {
  let ctx;

  it('exists', () => {
    expect(WikiPage);
  });

  beforeEach('render and find element', () => {
    ctx = renderWithProps({}, WikiPage);
  });

  it('displays loading component when there is no data', () => {
    expect(ctx.result.type).to.equal(Loading);
  });

  describe('renderWikiRevisions', () => {
    it('Renders a message when there are no revisions', () => {
      const wikiPage = {
        revisions: [],
      };

      const result = ctx.instance.renderWikiRevisions(wikiPage);
      const message = findText(result, MESSAGES.NO_REVISIONS);
      expect(message);
    });

    it('Handles case when Author is null', () => {
      const wikiPage = {
        revisions: [{author: null, page: 'foo', timestamp: Date.now() }],
      };

      expect(ctx.instance.renderWikiRevisions.bind(null, wikiPage)).to.not.throw(TypeError);
    });
  });

  describe('renderConversations', () => {
    it('Renders a message when there are no conversations', () => {
      const wikiPage = {
        conversations: [],
      };

      const result = ctx.instance.renderConversations(wikiPage);
      const message = findText(result, MESSAGES.NO_CONVERSATIONS);
      expect(message);
    });
  });

  describe('renderWikiPageList', () => {
    // there are wikiPages created by default so no need to check for empty case.
  });

  describe('renderWikiPage', () => {
    it('Renders a message when there is no markdown to show', () => {
      const wikiPage = {
        content_md: '',
        revision_by: {name: 'foo'},
        revision_date: Date.now(),
      };

      const result = ctx.instance.renderWikiPage(wikiPage);
      const message = findText(result, MESSAGES.NO_MARKDOWN);
      expect(message);
    });
  });
});
