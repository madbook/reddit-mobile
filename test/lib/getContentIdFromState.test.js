import chai from 'chai';
import sinonChai from 'sinon-chai';
import getContentId from '../../src/lib/getContentIdFromState';
import set from 'lodash/set';

const expect = chai.expect;

chai.use(sinonChai);

describe('lib: getContentIdFromState', () => {
  it('is a function', () => {
    expect(getContentId).to.be.a('function');
  });

  it('null on empty object', () => {
    const sampleState = {};
    set(sampleState, 'platform.currentPage.urlParams.subredditName', null);
    expect(getContentId(sampleState)).to.equal(null);
  });

  it('subreddit fullname on pics subreddit', () => {
    const sampleState = {};
    set(sampleState, 'platform.currentPage.urlParams.subredditName', 'pics');
    set(sampleState, 'subreddits.pics.name', 't5_2qh0u');
    expect(getContentId(sampleState)).to.equal('t5_2qh0u');
  });

  it('post ID on a comments page', () => {
    const sampleState = {};
    set(sampleState, 'platform.currentPage.urlParams.subredditName', 'pics');
    set(sampleState, 'platform.currentPage.urlParams.postId', 'foo');
    set(sampleState, 'subreddits.pics.name', 't5_2qh0u');
    set(sampleState, 'commentsPages.current', 'deadbeef');
    set(sampleState, 'commentsPages.deadbeef.postId', 't3_foo');
    expect(getContentId(sampleState)).to.equal('t3_foo');
  });

  it('null when platform.currentPage.url equals /', () => {
    const sampleState = {};
    set(sampleState, 'commentsPages.current', 'deadbeef');
    set(sampleState, 'commentsPages.current.deadbeef.postId', 't3_foo');
    set(sampleState, 'platform.currentPage.url', '/');
    expect(getContentId(sampleState)).to.equal(null);
  });
});
