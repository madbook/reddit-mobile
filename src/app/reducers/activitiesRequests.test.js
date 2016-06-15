import createTest from '@r/platform/createTest';
import merge from '@r/platform/merge';
import { models } from '@r/api-client';

import activitiesRequests from './activitiesRequests';
import * as activitiesActions from 'app/actions/activities';
import * as loginActions from 'app/actions/login';


createTest({ reducers: { activitiesRequests }}, ({ getStore, expect}) => {
  describe('activitiesRequests', () => {
    describe('LOGGED_IN and LOGGED_OUT', () => {
      it('should return default on log in', () => {
        const { store } = getStore();
        store.dispatch(loginActions.loggedIn());

        const { activitiesRequests } = store.getState();
        expect(activitiesRequests).to.eql({});
      });

      it('should return default on log out', () => {
        const { store } = getStore();
        store.dispatch(loginActions.loggedOut());

        const { activitiesRequests } = store.getState();
        expect(activitiesRequests).to.eql({});
      });
    });

    describe('FETCHING_ACTIVITES', () => {
      const ACTIVITIES_ID = '1';
      const ACTIVITIES_PARAMS = { user: 'me', activity: 'submitted' };

      it('should try the cache for a pre-existing activites-request first', () => {
        const CACHED_ACTIVITIES = {
          id: ACTIVITIES_ID,
          params: ACTIVITIES_PARAMS,
          loading: false,
          results: [],
        };

        const { store } = getStore({
          activitiesRequests: {
            [ACTIVITIES_ID]: CACHED_ACTIVITIES,
          },
        });

        store.dispatch(activitiesActions.fetching(ACTIVITIES_ID, CACHED_ACTIVITIES.params));

        const { activitiesRequests } = store.getState();
        expect(activitiesRequests[ACTIVITIES_ID]).to.equal(CACHED_ACTIVITIES);
      });

      it('should add a new request model to the store', () => {
        const { store } = getStore();
        store.dispatch(activitiesActions.fetching(ACTIVITIES_ID, ACTIVITIES_PARAMS));

        const { activitiesRequests } = store.getState();
        expect(activitiesRequests[ACTIVITIES_ID]).to.eql({
          id: ACTIVITIES_ID,
          params: ACTIVITIES_PARAMS,
          loading: true,
          results: [],
        });
      });
    });

    describe('RECEIVED_ACTIVITIES', () => {
      const ACTIVITIES_ID = '1';
      const ACTIVITIES_PARAMS = { user: 'me', activity: 'comments' };

      it('should update the state and results of an activites request', () => {
        const LOADING_ACTIVITIES = {
          id: ACTIVITIES_ID,
          params: ACTIVITIES_PARAMS,
          loading: true,
          results: [],
        };

        const RESULTS = [
          new models.Record('comment', 't1_comment'),
          new models.Record('comment', 't2_comment'),
        ];

        const { store } = getStore({
          activitiesRequests: {
            [ACTIVITIES_ID]: LOADING_ACTIVITIES,
          },
        });

        store.dispatch(activitiesActions.received(ACTIVITIES_ID, { results: RESULTS }));

        const { activitiesRequests } = store.getState();
        expect(activitiesRequests).to.eql(merge(activitiesRequests, {
          [ACTIVITIES_ID]: {
            loading: false,
            results: RESULTS,
          },
        }));
      });
    });
  });
});
