import chai from 'chai';
import sinonChai from 'sinon-chai';

const expect = chai.expect;

chai.use(sinonChai);

import short from '../../src/lib/formatDifference';

describe('lib: formatDifference', () => {
  it('is a function', () => {
    expect(short).to.be.a('function');
  });

  const min = 60 * 1000;
  const hour = min * 60;
  const day = hour * 24;

  const date = Date.now();

  it('returns the delta time with a single letter abbreviated unit', () => {
    const dayAgo = date - day;
    expect(short(dayAgo)).to.equal('1d');

    const hourAgo = date - hour;
    expect(short(hourAgo)).to.equal('1h');

    const minAgo = date - min;
    expect(short(minAgo)).to.equal('1m');
  });
});
