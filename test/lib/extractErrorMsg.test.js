import chai from 'chai';
import sinonChai from 'sinon-chai';
import extractErrorMsg from '../../src/lib/extractErrorMsg';

const expect = chai.expect;
const TEST_MESSAGE = 'error message';
const GENERIC_MESSAGE = 'There was a problem';

chai.use(sinonChai);

describe('lib: extractErrorMsg', () => {
  it('returns error messages nested in a complete, 2-deep array', () => {
    expect(extractErrorMsg({ errors: [['error type', TEST_MESSAGE]] }))
      .to.equal(TEST_MESSAGE);
  });

  it('returns any message found in error.message', () => {
    expect(extractErrorMsg({ message: TEST_MESSAGE }))
    .to.equal(TEST_MESSAGE);
  });

  it('returns a generic message for all other cases', () => {
    expect(extractErrorMsg({ errors: [] }))
      .to.equal(GENERIC_MESSAGE);

    expect(extractErrorMsg({ errors: [[]] }))
      .to.equal(GENERIC_MESSAGE);

    expect(extractErrorMsg(null))
      .to.equal(GENERIC_MESSAGE);

    expect(extractErrorMsg({}))
      .to.equal(GENERIC_MESSAGE);
  });
});
