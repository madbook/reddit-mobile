import chai from 'chai';
import sinonChai from 'sinon-chai';
import getSubreddit from '../../src/lib/getSubredditFromState';
import set from 'lodash/set';

const expect = chai.expect;

chai.use(sinonChai);

describe('lib: getSubredditFromState', () => {
  it('is a function', () => {
    expect(getSubreddit).to.be.a('function');
  });
  const sampleState = {};

  it('null on empty object', () => {
    set(sampleState, 'platform.currentPage.urlParams.subredditName', null);
    expect(getSubreddit(sampleState)).to.equal(null);
  });

  it('pics on a pics subreddit', () => {
    set(sampleState, 'platform.currentPage.urlParams.subredditName', 'pics');
    expect(getSubreddit(sampleState)).to.equal('pics');
  });

  it('null on commentsPages.current.results being null', () => {
    set(sampleState, 'platform.currentPage.urlParams.subredditName', null);
    set(sampleState, 'commentsPages.current', 'pics');
    set(sampleState, 'commentsPages.pics.results', []);
    expect(getSubreddit(sampleState)).to.equal(null);
  });

  it('null on commentsPages.current.results being null', () => {
    set(sampleState, 'commentsPages.pics.results[0].uuid', 't3_foobar');
    set(sampleState, 'comments.t3_foobar', undefined);
    expect(getSubreddit(sampleState)).to.equal(null);
  });

  it('null on commentsPages.current.results being null', () => {
    set(sampleState, 'comments.t3_foobar.subreddit', 'gifs');
    expect(getSubreddit(sampleState)).to.equal('gifs');
  });

});
