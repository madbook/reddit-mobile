import createTest from 'platform/createTest';
import merge from 'platform/merge';

import recommendedSubreddits from './recommendedSubreddits';
import * as recommendedSubredditsActions from 'app/actions/recommendedSubreddits';

createTest({ reducers: { recommendedSubreddits } }, ({ getStore, expect }) => {
  describe('recommendedSubreddits', () => {
    describe('RECEIVED_RECOMMENDED_SUBREDDITS', () => {
      it('should update state with recommended subreddits', () => {
        const SR_NAME = 'wow'; 
        const REC_SR_LIST = [{ 'uuid': 'pics' }, { 'uuid': 'askreddit' }];

        const { store } = getStore({
          recommendedSubreddits: null,
        });

        store.dispatch(recommendedSubredditsActions.received(
          SR_NAME,
          { results: REC_SR_LIST, response: { status: 200 } },
        ));

        const { recommendedSubreddits } = store.getState();
        expect(recommendedSubreddits).to.eql(merge(recommendedSubreddits, {
          [SR_NAME]: ['pics', 'askreddit'],
        }));

      });
    });
  });
});
