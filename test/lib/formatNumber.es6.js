import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

var expect = chai.expect;

chai.use(sinonChai);

import formatNumber from '../../src/lib/formatNumber';

describe('lib: formatNumber', () => {
  it('is a function', () => {
    expect(formatNumber).to.be.a('function');
  });

  it('returns numbers greater than 100, formatted with commas', () => {
    expect(formatNumber(9001)).to.equal('9,001');
  });

  it('works with numbers with an arbitray number of commas required', () => {
    expect(formatNumber(1234567891234)).to.equal('1,234,567,891,234');
  });

  it('doesn"t add unneeded commas', () => {
    expect(formatNumber(123)).to.equal('123');
  });
});
