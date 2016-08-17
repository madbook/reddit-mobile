import chai from 'chai';
import sinonChai from 'sinon-chai';
import { makeWikiPath } from '../../src/lib/makeWikiPath';

const expect = chai.expect;

chai.use(sinonChai);

describe('lib: makeWikiPath', () => {
  it('is a function', () => {
    expect(makeWikiPath).to.be.a('function');
  });

  it('genertaes a wikipath', () => {
    const subredditName = 'pics';
    const path = 'foo';
    const expectedOutput = 'r/pics/wiki/foo';
    expect(makeWikiPath(subredditName, path)).to.equal(expectedOutput);
  });

  it('eliminates trailing slash', () => {
    const subredditName = 'pics';
    const path = 'foo/';
    const expectedOutput = 'r/pics/wiki/foo';
    expect(makeWikiPath(subredditName, path)).to.equal(expectedOutput);
  });

  it('defaults to index', () => {
    const subredditName = 'pics';
    const path = null;
    const expectedOutput = 'r/pics/wiki/index';
    expect(makeWikiPath(subredditName, path)).to.equal(expectedOutput);
  });
});
