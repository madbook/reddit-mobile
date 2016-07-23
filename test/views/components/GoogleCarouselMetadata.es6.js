import chai from 'chai';
import sinonChai from 'sinon-chai';
import {
  isRedditDomain,
  addUtmTracking,
} from '../../../src/views/components/GoogleCarouselMetadata';


chai.use(sinonChai);
const expect = chai.expect;


describe('GoogleCarouselMetadata: isRedditDomain', () => {
  it('handles localhost', () => {
    expect(isRedditDomain('localhost')).to.equal(false);
  });

  it('handles common reddit domains', () => {
    expect(isRedditDomain('reddit.com')).to.equal(true);
    expect(isRedditDomain('m.reddit.com')).to.equal(true);
    expect(isRedditDomain('np.reddit.com')).to.equal(true);
    expect(isRedditDomain('www.reddit.com')).to.equal(true);
  });

  it('ignores other reddit domain names', () => {
    expect(isRedditDomain('i.redd.it')).to.equal(false);
    expect(isRedditDomain('i.reddituploads.com')).to.equal(false);
    expect(isRedditDomain('redditmedia.com')).to.equal(false);
  });

});

describe('GoogleCarouselMetadata: addUtmTracking', () => {
  it('ignores non-reddit domains', () => {
    const ignoredUrls = [
      'http://localhost:9000',
      'https://i.reddituploads.com/82d0fb0eb19648b3ab300fd0e1f54195?fit=max&h=1536&w=1536&s=6b355faf769e0b72535757fa196d6c34',
    ];

    ignoredUrls.forEach((url) => {
      expect(addUtmTracking(url)).to.equal(url);
    });
  });

  it('handles null urls', () => {
    expect(addUtmTracking(null)).to.equal(null);
  });

  it('adds tracking to reddit domains', () => {
    const redditUrls = [
      'http://m.reddit.com/r/explainlikeimfive/comments/4ukacd/eli5_why_college_is_so_high_priced_in_the_us/',
      'https://www.reddit.com/r/IAmA/comments/4red1n/were_scientists_and_engineers_on_nasas_juno/',
      'https://np.reddit.com/r/BitcoinMarkets/comments/4rgor8/daily_discussion_wednesday_july_06_2016/d51m0ee?context=3#randomHashAnchor',
    ];

    redditUrls.forEach((url) => {
      expect(addUtmTracking(url)).to.include('utm_source=search');
      expect(addUtmTracking(url)).to.include('utm_medium=structured_data');
    });
  });
});
