import createTest from 'platform/createTest';
import apiRequestHeaders, { DEFAULT } from './apiRequestHeaders';
import * as apiRequestHeadersActions from 'app/actions/apiRequestHeaders';

createTest({ reducers: { apiRequestHeaders }}, ({ getStore, expect }) => {
  describe('DEFAULT', () => {
    it('should return the default value on start', () => {
      const { store } = getStore();
      const { apiRequestHeaders } = store.getState();
      expect(apiRequestHeaders).to.eql(DEFAULT);
    });
  });

  describe('SET', () => {
    it('should update to use the value from the set action', () => {
      const { store } = getStore({
        apiRequestHeaders: { 'Cookie': 'nightmode=true;' },
      });

      const newHeaders = {
        'accept-language': 'en',
      };
      store.dispatch(apiRequestHeadersActions.set(newHeaders));
      const { apiRequestHeaders } = store.getState();
      expect(apiRequestHeaders).to.eql(newHeaders);
    });
  });
});
