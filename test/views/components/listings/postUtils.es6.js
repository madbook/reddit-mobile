import chai from 'chai';
import sinonChai from 'sinon-chai';
import {
  isPostNSFW,
  isPostDomainExternal,
} from '../../../../src/views/components/listings/postUtils';

chai.use(sinonChai);
const expect = chai.expect;

describe('postUtils: isPostNSFW', () => {
  it('returns true when the post is marked over_18', () => {
    expect(isPostNSFW({title: 'test', 'over_18': true})).to.be.true;
    expect(isPostNSFW({title: 'test', 'over_18': false})).to.be.false;
  });

  it('returns true when the post title contains NSFW or NSFL in thte title', () => {
    expect(isPostNSFW({title: 'nSfW'})).to.be.true;
    expect(isPostNSFW({title: 'NsfL;'})).to.be.true;
  });
});

describe('postUtils: isPostDomainExternal', () => {
  it('returns true when the post links outside reddit', () => {
    const subreddit = 'askreddit';
    expect(isPostDomainExternal({domain: `self.${subreddit}`, subreddit})).to.be.false;
    expect(isPostDomainExternal({domain: 'imgur.com', subreddit})).to.be.true;
  });
});
