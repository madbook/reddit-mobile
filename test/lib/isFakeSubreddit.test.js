import chai from 'chai';
import sinonChai from 'sinon-chai';

import isFakeSubreddit, { FAKE_SUBS } from 'lib/isFakeSubreddit';


chai.use(sinonChai);
const expect = chai.expect;

describe('lib: isFakeSubreddit', () => {
  it('is a function', () => {
    expect(isFakeSubreddit).to.be.a('function');
  });

  it('returns false for normal subreddits', () => {
    expect(isFakeSubreddit('askreddit')).to.be.false;
  });

  it('returns true for manual multi reddits', () => {
    expect(isFakeSubreddit('javascript+reactjs')).to.be.true;
    expect(isFakeSubreddit('destinythegame+division+halo')).to.be.true;
  });

  it('returns true for any of the special fake fubs', () => {
    FAKE_SUBS.forEach((fakeSub) => {
      expect(isFakeSubreddit(fakeSub)).to.be.true;
    });
  });
});
