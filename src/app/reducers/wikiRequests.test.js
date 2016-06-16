import createTest from '@r/platform/createTest';

import wikiRequests from './wikiRequests';
import * as wikiActions from 'app/actions/wiki';

const REQUIRED_KEYS = ['id', 'loading'];

createTest({ reducers: { wikiRequests } }, ({ getStore, expect }) => {
  describe('wikiRequests', () => {
    describe('FETCHING_WIKI', () => {
      it('should fetch a wiki', () => {
        const WIKI = { id: 'wiki/faq', loading: true };

        const { store } = getStore();
        store.dispatch(wikiActions.fetching({ path: 'faq' }));

        const { wikiRequests } = store.getState();
        expect(wikiRequests).to.have.keys('wiki/faq');
        expect(wikiRequests['wiki/faq']).to.have.all.keys(REQUIRED_KEYS);
        expect(wikiRequests['wiki/faq']).to.eql(WIKI);
      });
    });

    describe('RECEIVED_WIKI', () => {
      it('should update wiki data when request is finished', () => {
        const RESULT = { type: 'wiki', uuid: 'wiki/faq' };

        const { store } = getStore();
        store.dispatch(wikiActions.received({ path: 'faq' }, RESULT));

        const { wikiRequests } = store.getState();
        expect(wikiRequests).to.have.keys('wiki/faq');
        expect(wikiRequests['wiki/faq']).to.have.all.keys(REQUIRED_KEYS);
      });
    });
  });
});
