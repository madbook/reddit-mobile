import createTest from '@r/platform/createTest';

import mail, { DEFAULT } from './mail';

import * as loginActions from 'app/actions/login';
import * as mailActions from 'app/actions/mail';

createTest({ reducers: { mail } }, ({ getStore, expect }) => {
  describe('mail', () => {
    describe('LOGGED_IN and LOGGED_OUT', () => {
      it('should return default on log out', () => {
        const { store } = getStore({
          mail: {},
        });

        store.dispatch(loginActions.loggedOut());
        const { mail } = store.getState();
        expect(mail).to.eql(DEFAULT);
      });

      it('should return the default on log in', () => {
        const { store } = getStore({
          mail: {},
        });

        store.dispatch(loginActions.loggedIn());
        const { mail } = store.getState();
        expect(mail).to.eql(DEFAULT);
      });
    });

    describe('FETCHING', () => {
      it('should think it is fetching', () => {
        const mailType = 'messages';
        const { store } = getStore({ mail: DEFAULT });
        const expected = {
          ...DEFAULT,
          [mailType]: { ...DEFAULT[mailType], pending: true, error: null },
        };

        store.dispatch(mailActions.setInboxPending(mailType));
        const { mail } = store.getState();
        expect(mail).to.eql(expected);
      });
    });

    describe('RECEIVED', () => {
      it('should think it has successfully received', () => {
        const mailType = 'messages';
        const { store } = getStore({ mail: DEFAULT });
        const meta = { foo: 'bar' };
        const order = [ 't4_1', 't4_2', 't4_3' ];
        const apiResponse = { meta, results: order };
        const expected = {
          ...DEFAULT,
          [mailType]: { ...DEFAULT[mailType], meta, order, pending: false, error: null },
        };

        store.dispatch(mailActions.setInboxSuccess(mailType, apiResponse));
        const { mail } = store.getState();
        expect(mail).to.eql(expected);
      });
    });

    describe('FAILED', () => {
      it('should think it has failed', () => {
        const mailType = 'messages';
        const error = 'THIS IS AN ERROR';
        const { store } = getStore({ mail: DEFAULT });
        const expected = {
          ...DEFAULT,
          [mailType]: { ...DEFAULT[mailType], error, pending: false },
        };

        store.dispatch(mailActions.setInboxFailure(mailType, error));
        const { mail } = store.getState();
        expect(mail).to.eql(expected);
      });
    });
  });
});
