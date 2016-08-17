import chai from 'chai';
import sinonChai from 'sinon-chai';
import { cleanObject } from '../../src/lib/cleanObject';

const expect = chai.expect;

chai.use(sinonChai);

describe('lib: cleanObject', () => {
  it('is a function', () => {
    expect(cleanObject).to.be.a('function');
  });

  const obj = { foo: null, bar: undefined, baz: true };

  it('removes null and undefined values', () => {
    expect(cleanObject(obj)).to.eql({ baz: true });
  });
});
