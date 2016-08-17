import chai from 'chai';
import sinonChai from 'sinon-chai';
import rootDomain from '../../src/lib/rootDomain';

chai.use(sinonChai);
const expect = chai.expect;

describe('lib: rootDomain', () => {
  it('is a function', () => {
    expect(rootDomain).to.be.a('function');
  });

  it('returns nothing with invalid input and doesn\'t error', () => {
    expect(rootDomain(undefined)).to.be.undefined;
    expect(rootDomain('dankmemes')).to.be.undefined;
    expect(rootDomain('app://fake.gif')).to.be.undefined;
    expect(rootDomain('imgur.com')).to.be.undefined; // requires https?:// prefix
  });

  it('works as expected no matter how many subdomains there are', () => {
    const gfycatRoot = 'gfycat.com';
    expect(rootDomain(`http://thumbs.foobar.thing.${gfycatRoot}`)).to.equal(gfycatRoot);
    expect(rootDomain(`https://giant.${gfycatRoot}`)).to.equal(gfycatRoot);
    expect(rootDomain(`http://www.${gfycatRoot}`)).to.equal(gfycatRoot);
    expect(rootDomain(`https://${gfycatRoot}`)).to.equal(gfycatRoot);
  });
});
