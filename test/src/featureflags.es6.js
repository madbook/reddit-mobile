import chai from 'chai';
import sinonChai from 'sinon-chai';
import feature from '../../src/featureflags.es6.js';

const config = {
  loggedintest: { loggedin: true },
  usertest: { users: ['abc'] },
  employeetest: { employee: true },
  admintest: { admin: true },
  betatest: { beta: true },
  querytest: { url: 'test' },
};

const feet = feature.clone(config);

const expect = chai.expect;

chai.use(sinonChai);

describe('feature flags', () => {
  it('has a loggedin rule that checks token', () => {
    let f = feet.withContext({
      props: { ctx: { token: 'abc' } },
    });

    expect(f.enabled('loggedintest')).to.be.true;

    f = feet.withContext({
      props: { ctx: { } },
    });

    expect(f.enabled('loggedintest')).to.be.false;
  });

  it('has a user rule that checks usernames', () => {
    let f = feet.withContext({
      state: { data: { user: { name: 'abc' } } },
    });

    expect(f.enabled('usertest')).to.be.true;

    f = feet.withContext({
      state: { data: { user: { name: 'def' } } },
    });

    expect(f.enabled('usertest')).to.be.false;

    f = feet.withContext({
      state: { data: { } },
    });

    expect(f.enabled('usertest')).to.be.false;
  });

  it('has a user rule that checks is_employee', () => {
    let f = feet.withContext({
      state: { data: { user: { is_employee: true } } },
    });

    expect(f.enabled('employeetest')).to.be.true;

    f = feet.withContext({
      state: { data: { user: { is_employee: false } } },
    });

    expect(f.enabled('employeetest')).to.be.false;

    f = feet.withContext({
      state: { data: { } },
    });

    expect(f.enabled('employeetest')).to.be.false;
  });

  it('has a user rule that checks is_admin', () => {
    let f = feet.withContext({
      state: { data: { user: { is_admin: true } } },
    });

    expect(f.enabled('admintest')).to.be.true;

    f = feet.withContext({
      state: { data: { user: { is_admin: false } } },
    });

    expect(f.enabled('admintest')).to.be.false;

    f = feet.withContext({
      state: { data: { } },
    });

    expect(f.enabled('admintest')).to.be.false;
  });

  it('has a user rule that checks is_beta', () => {
    let f = feet.withContext({
      state: { data: { user: { is_beta: true } } },
    });

    expect(f.enabled('betatest')).to.be.true;

    f = feet.withContext({
      state: { data: { user: { is_beta: false } } },
    });

    expect(f.enabled('betatest')).to.be.false;

    f = feet.withContext({
      state: { data: { } },
    });

    expect(f.enabled('betatest')).to.be.false;
  });

  it('has a url rule that checks querystring', () => {
    let f = feet.withContext({
      props: { ctx: { query: { feature_test: 'true' } } },
    });

    expect(f.enabled('querytest')).to.be.true;

    f = feet.withContext({
      props: { ctx: { query: { feature_test: undefined } } },
    });

    expect(f.enabled('querytest')).to.be.true;

    f = feet.withContext({
      props: { ctx: { query: { test: 'true' } } },
    });

    expect(f.enabled('querytest')).to.be.false;
  });
});
