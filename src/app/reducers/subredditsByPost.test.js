import createTest from '@r/platform/createTest';
import merge from '@r/platform/merge';

import subredditsByPost from './subredditsByPost';
import * as subredditsByPostActions from 'app/actions/subredditsByPost';

createTest({ reducers: { subredditsByPost } }, ({ getStore, expect }) => {
  describe('subredditsByPost', () => {
    describe('RECEIVED_SUBREDDITS_BY_POST', () => {
      it('should update state with recommended subreddits', () => {
        const POST_ID = 'abc123';
        const REC_SR_LIST = [{ 'uuid': 'pics' }, { 'uuid': 'askreddit' }];

        const { store } = getStore({
          subredditsByPost: null,
        });

        store.dispatch(subredditsByPostActions.received(
          POST_ID,
          { results: REC_SR_LIST, response: { status: 200 } },
        ));

        const { subredditsByPost } = store.getState();
        expect(subredditsByPost).to.eql(merge(subredditsByPost, {
          [POST_ID]: ['pics', 'askreddit'],
        }));

      });
    });
  });
});
