import chai from 'chai';
import sinonChai from 'sinon-chai';
import { formatNumber } from '../../src/lib/formatNumber';

chai.use(sinonChai);

const expect = chai.expect;

const TEST_INPUTS = [
  1,
  10,
  100,
  1000,
  10000,
  100000,
  1000000,
];

const TEST_OUTPUTS = [
  '1',
  '10',
  '100',
  '1,000',
  '10,000',
  '100,000',
  '1,000,000',
];

describe('lib: formatNumber', () => {
  it('is a function', () => {
    expect(formatNumber).to.be.a('function');
  });

  it('adds commas to pretty print long numbers', () => {
    TEST_INPUTS.forEach((testInput, idx) => {
      expect(formatNumber(testInput)).to.equal(TEST_OUTPUTS[idx]);
    });
  });
});
