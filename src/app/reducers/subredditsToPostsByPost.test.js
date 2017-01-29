import createTest from 'platform/createTest';
import merge from 'platform/merge';
import subredditsToPostsByPost from './subredditsToPostsByPost';
import * as subredditsToPostsByPostActions from 'app/actions/subredditsToPostsByPost';

createTest({ reducers: { subredditsToPostsByPost } }, ({ getStore, expect }) => {
  describe('subredditsToPostsByPost', () => {
    describe('RECEIVED_SUBREDDITS_TO_POSTS_BY_POST', () => {
      it('should update state with recommended posts', () => {
        const POST_ID = 'abc123';
        const REC_POST_LIST = [{ 'uuid': 't3_1' }, { 'uuid': 't3_2' }];

        const { store } = getStore({
          subredditsToPostsByPost: null,
        });

        store.dispatch(subredditsToPostsByPostActions.received(
          POST_ID,
          { results: REC_POST_LIST, response: { status: 200 } },
        ));

        const { subredditsToPostsByPost } = store.getState();
        expect(subredditsToPostsByPost).to.eql(merge(subredditsToPostsByPost, {
          [POST_ID]: ['t3_1', 't3_2'],
        }));

      });
    });
  });
});
