import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

const expect = chai.expect;

chai.use(sinonChai);

import { loginRegisterOriginalUrl } from '../../src/routes';

describe('routes: loginRegisterOriginalUrl', () => {
  it('is a function', () => {
    expect(loginRegisterOriginalUrl).to.be.a('function');
  });

  it('returns nothing when given invalid input', () => {
    expect(loginRegisterOriginalUrl(null, null)).to.equal(undefined);

    const invalidPathQueryParam = {
      originalUrl: 'someInvalidPath',
    };

    expect(loginRegisterOriginalUrl(invalidPathQueryParam, null)).to.equal(undefined);

    const invalidReferrer = {
      referer: 'someapp://listingspage',
    };

    expect(loginRegisterOriginalUrl(null, invalidReferrer)).to.equal(undefined);
  });

  it('uses originalUrl from the queryParam even when there\'s a valid header', () => {
    const queryParamReferer = {
      originalUrl: '/r/pics',
    };

    const headerRefer = {
      referer: 'https://m.reddit.com/register?originalUrl=foobar',
    };

    expect(loginRegisterOriginalUrl(queryParamReferer, headerRefer)).to.equal(queryParamReferer.originalUrl);
  });

  it('turns absolute urls into relative paths', () => {
    const relativePath = '/r/DestinyTheGame';
    const queryParamReferer = {
      originalUrl: `https://m.reddit.com${relativePath}`,
    };

    expect(loginRegisterOriginalUrl(queryParamReferer, null)).to.equal(relativePath);

    const headerReferer = {
      referer: `https://somebadwebsite.com${relativePath}`,
    };

    expect(loginRegisterOriginalUrl(null, headerReferer)).to.equal(relativePath);

    const otherSiteReferer = {
      referer: 'https://www.fakereddit.com',
    };

    // this should be '/' so it returns to the frontpage of
    // reddit if someone tries to redirect back to their site
    expect(loginRegisterOriginalUrl(null, otherSiteReferer)).to.equal('/');
  });
});
