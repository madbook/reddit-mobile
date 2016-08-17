import chai from 'chai';
import sinonChai from 'sinon-chai';
import RingStack from '../../src/lib/RingStack';

const expect = chai.expect;

chai.use(sinonChai);

// Not read-only. Could set private variables

describe('lib: RingStack', () => {
  const stack = new RingStack(3);
  it('insert elements', () => {
    stack.push(1);
    expect(stack.values()).to.eql([1]);
    stack.push(2);
    expect(stack.values()).to.eql([2, 1]);
    stack.push(3);
    expect(stack.values()).to.eql([3, 2, 1]);
  });

  it('overwrite elements in a particular order', () => {
    stack.push(4);
    expect(stack.values()).to.eql([4, 3, 2]);
    stack.push(5);
    expect(stack.values()).to.eql([5, 4, 3]);
  });

  it('is not read only. could set private variables', () => {
    stack.size = 4;
    expect(stack.size).to.equal(4);
    stack.push(6);
    expect(stack.values()).to.eql([6, 5, 4]);
    expect(stack.head).to.equal(3);
    stack.push(7);
    expect(stack.values()).to.eql([7, 6, 5, 4]);
    expect(stack.head).to.equal(0);
    stack.push(8);
    expect(stack.values()).to.eql([8, 7, 6, 5]);
    expect(stack.head).to.equal(1);
  });
});
