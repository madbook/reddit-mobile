import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

var expect = chai.expect;

chai.use(sinonChai);

import titleCase from '../../src/lib/titleCase';

describe('lib: titleCase', () => {
  it('is a function', () => {
    expect(titleCase).to.be.a('function');
  });

  it('Returns all words with only the first letter(a-z) capitalized.', () => {
    expect(titleCase('hello worlD #1')).to.equal('Hello World #1');
  });
});
