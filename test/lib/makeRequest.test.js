import chai from 'chai';
import sinonChai from 'sinon-chai';
import makeRequest from '../../src/lib/makeRequest';

const expect = chai.expect;
const ENDPOINT = 'it doesnt matter what this is';

chai.use(sinonChai);

describe('lib: makeRequest', () => {
  it('has rest methods', () => {
    expect(makeRequest.get).to.exist;
    expect(makeRequest.post).to.exist;
    expect(makeRequest.patch).to.exist;
    expect(makeRequest.put).to.exist;
    expect(makeRequest.del).to.exist;
  });

  it('returns a promise', () => {
    expect(makeRequest.get(ENDPOINT).then()).to.be.a('promise');
    expect(makeRequest.post(ENDPOINT).then()).to.be.a('promise');
    expect(makeRequest.patch(ENDPOINT).then()).to.be.a('promise');
    expect(makeRequest.put(ENDPOINT).then()).to.be.a('promise');
    expect(makeRequest.del(ENDPOINT).then()).to.be.a('promise');
  });
});
