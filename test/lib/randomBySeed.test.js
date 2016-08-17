import chai from 'chai';
import sinonChai from 'sinon-chai';
import randomBySeed from '../../src/lib/randomBySeed';

const expect = chai.expect;

chai.use(sinonChai);

describe('lib: randomBySeed', () => {
  const randFn = randomBySeed(1);
  it('is a function', () => {
    expect(randFn).to.be.a('function');
  });

  it('generates a consistent value', () => {
    expect(randFn()).to.equal(0.7098480789645691);
    expect(randFn()).to.equal(0.3875516056905326);
    expect(randFn()).to.equal(0.2053141528958804);
  });
});
