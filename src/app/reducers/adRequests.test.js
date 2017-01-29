import createTest from 'platform/createTest';
import PostModel from 'apiClient/models/PostModel';
// adActions.RECEIVED calls model.toRecord
// so we need to test with a PostModel

import * as loginActions from 'app/actions/login';
import * as adActions from 'app/actions/ads';

import adRequests, { DEFAULT } from './adRequests';

createTest({ reducers: { adRequests }}, ({ getStore, expect }) => {
  describe('adRequests', () => {
    describe('LOGGED_IN and LOGGED_OUT', () => {
      it('should return default on log out', () => {
        const { store } = getStore({
          adRequests: {
            'testing': { logout: 'clears' },
          },
        });

        store.dispatch(loginActions.loggedOut());
        const { adRequests } = store.getState();
        expect(adRequests).to.eql(DEFAULT);
      });

      it('should return default on log in', () => {
        const { store } = getStore({
          adRequests: {
            'testing': { login: 'clears' },
          },
        });

        store.dispatch(loginActions.loggedIn());
        const { adRequests } = store.getState();
        expect(adRequests).to.eql(DEFAULT);
      });
    });
  });

  describe('FETCHING', () => {
    it('should add a new entry to state on a fetching action', () => {
      const id = 'test';

      const { store } = getStore();
      store.dispatch(adActions.fetching(id));
      const { adRequests } = store.getState();
      expect(adRequests[id]).to.be.an('object');
    });

    it('should reset state on a fetching action', () => {
      const id = 'test';

      const { store } = getStore({
        adRequests:{
          [id]: {
            pending: false,
            failed: true,
          },
        },
      });

      store.dispatch(adActions.fetching(id));
      const adRequest = store.getState().adRequests[id];
      expect(adRequest).to.eql({
        adId: id,
        pending: true,
        ad: undefined,
        impressionTracked: false,
        failed: false,
      });
    });
  });

  describe('RECEIVED', () => {
    it('should set pending to to false and track the ad record', () => {
      const { store } = getStore();

      const adId = 'abcd';
      const id = 't3_test';
      const adPost = PostModel.fromJSON({ id });

      store.dispatch(adActions.received(adId, adPost));
      const adRequest = store.getState().adRequests[adId];
      expect(adRequest).to.eql({
        pending: false,
        ad: adPost.toRecord(),
      });
    });
  });

  describe('FAILED', () => {
    it('should set pending to false and failed to true', () => {
      const { store } = getStore();
      const adId = 'abcd';

      store.dispatch(adActions.failed(adId));
      const adRequest = store.getState().adRequests[adId];
      expect(adRequest).to.eql({
        pending: false,
        failed: true,
      });
    });
  });

  describe('TRACKING_AD', () => {
    it('should set impressionTracked to true', () => {
      const { store } = getStore();
      const adId = 'abcd';

      store.dispatch(adActions.tracking(adId));
      const adRequest = store.getState().adRequests[adId];
      expect(adRequest).to.eql({
        impressionTracked: true,
      });
    });
  });
});
