import createTest from '@r/platform/createTest';
import * as platformActions from '@r/platform/actions';

import routes from 'app/router';
import posting from './posting';
import * as loginActions from 'app/actions/login';
import * as postingActions from 'app/actions/posting';

createTest({ reducers: { posting }, routes }, ({ getStore, expect }) => {
  describe('posting', () => {
    describe('LOGGED_IN and LOGGED_OUT', () => {
      const INITIAL = {
        title: 'a',
        meta: 'b',
        gRecaptchaResponse: 'c',
        captchaIden: 'd',
        currentType: 'e',
      };

      it('should return default on log in', () => {
        const { store } = getStore({ posting: INITIAL });
        store.dispatch(loginActions.loggedIn());

        const { posting } = store.getState();
        expect(posting).to.eql({
          title: '',
          meta: '',
          gRecaptchaResponse: '',
          captchaIden: '',
          currentType: '',
        });
      });

      it('should return default on log out', () => {
        const { store } = getStore({ posting: INITIAL });
        store.dispatch(loginActions.loggedOut());

        const { posting } = store.getState();
        expect(posting).to.eql({
          title: '',
          meta: '',
          gRecaptchaResponse: '',
          captchaIden: '',
          currentType: '',
        });
      });
    });

    describe('CAPTCHA_NEEDED', () => {
      it('should update the captchaIden', () => {
        const { store } = getStore();
        store.dispatch({
          type: postingActions.CAPTCHA_NEEDED,
          captchaIden: 'foobar',
        });

        const { posting } = store.getState();
        expect(posting.captchaIden).to.equal('foobar');
      });
    });

    describe('CLOSE_CAPTCHA', () => {
      it('should set captchaIden to its default', () => {
        const { store } = getStore();
        store.dispatch({ type: postingActions.CLOSE_CAPTCHA });

        const { posting } = store.getState();
        expect(posting.captchaIden).to.equal('');
      });
    });

    describe('UPDATE_FIELD', () => {
      it('should update values for a given field', () => {
        const { store } = getStore();
        store.dispatch(postingActions.updateField('sr', 'foobar'));

        const { posting } = store.getState();
        expect(posting.sr).to.equal('foobar');
      });
    });

    describe('SET_PAGE', () => {
      it('should allow valid post types to be set', () => {
        const { store } = getStore();
        store.dispatch(platformActions.setPage('/submit', {
          queryParams: { type: 'link' },
        }));

        const { posting } = store.getState();
        expect(posting.currentType).to.equal('link');
      });

      it('should not allow invalid post types to be set', () => {
        const { store } = getStore();
        store.dispatch(platformActions.setPage('/submit', {
          queryParams: { type: 'foobar' },
        }));

        const { posting } = store.getState();
        expect(posting.currentType).to.equal('self');
      });

      it('should reset the fields if type is different than the current', () => {
        const { store } = getStore({ posting: { currentType: 'self' } });
        store.dispatch(platformActions.setPage('/submit', {
          queryParams: { type: 'link' },
        }));

        const { posting } = store.getState();
        expect(posting).to.eql({
          title: '',
          meta: '',
          gRecaptchaResponse: '',
          captchaIden: '',
          currentType: 'link',
        });
      });

      it('should not reset the fields if type is same as the current', () => {
        const { store } = getStore({ posting: {
          title: 'a',
          meta: 'b',
          gRecaptchaResponse: 'c',
          captchaIden: '',
          currentType: 'self',
        }});

        store.dispatch(platformActions.setPage('/submit', {
          queryParams: { type: 'self' },
        }));

        const { posting } = store.getState();
        expect(posting).to.eql({
          title: 'a',
          meta: 'b',
          gRecaptchaResponse: 'c',
          captchaIden: '',
          currentType: 'self',
        });
      });
    });
  });
});
