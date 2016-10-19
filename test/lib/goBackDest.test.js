import chai from 'chai';
import sinonChai from 'sinon-chai';
import goBackDest from '../../src/lib/goBackDest';

const expect = chai.expect;

chai.use(sinonChai);

// Not read-only. Could set private variables

describe('lib: goBackDest', () => {
  it('is a function', () => {
    expect(goBackDest).to.be.a('function');
  });

  it('defaults to front page on empty history.', () => {
    const platform = {
      currentPageIndex: 0,
      history: [
        {
          url: '/',
        },
      ],
    };
    const excludedUrls = [];
    expect(goBackDest(platform, excludedUrls)).to.equal('/');
  });

  it('returns /r/art for excluded urls', () => {
    const platform = {
      currentPageIndex: 2,
      history: [
        {
          url: '/r/art',
        },
        {
          url: '/login',
        },
        {
          url: '/register',
        },
      ],
    };
    const excludedUrls = ['/login', '/register'];
    expect(goBackDest(platform, excludedUrls)).to.equal('/r/art');
  });

  it('returns last page if no excluded urls', () => {
    const platform = {
      currentPageIndex: 2,
      history: [
        {
          url: '/r/art',
        },
        {
          url: '/login',
        },
        {
          url: '/register',
        },
      ],
    };
    const excludedUrls = [];
    expect(goBackDest(platform, excludedUrls)).to.equal('/login');
  });

  it('returns frontpage if all excluded urls', () => {
    const platform = {
      currentPageIndex: 2,
      history: [
        {
          url: '/login',
        },
        {
          url: '/login',
        },
        {
          url: '/register',
        },
      ],
    };
    const excludedUrls = ['/login', '/register'];
    expect(goBackDest(platform, excludedUrls)).to.equal('/');
  });

});
