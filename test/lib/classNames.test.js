import chai from 'chai';
import sinonChai from 'sinon-chai';
import classNames from '../../src/lib/classNames';

const expect = chai.expect;

chai.use(sinonChai);

describe('lib: classNames', () => {
  it('is a function', () => {
    expect(classNames).to.be.a('function');
  });

  it('creates correct classname for string types', () => {
    expect(classNames('hello', 'world', 'baby')).to.equal('hello world baby');
    expect(classNames('hello')).to.equal('hello');
  });

  it('allows duplicate css classes', () => {
    expect(classNames('hello', 'hello')).to.equal('hello hello');
  });

  it('creates correct classname for array types', () => {
    expect(classNames(['hello', 'world', 'baby'])).to.equal('hello world baby');
  });

  it('creates correct classname for object types', () => {
    expect(classNames({ baz: false, bob: true })).to.equal('bob');
  });

  it('does not support nested dictionaries. Only allows truthy values', () => {
    const d = { baz: true };
    d.bob = {};
    expect(classNames(d)).to.equal('baz bob');
  });
});
