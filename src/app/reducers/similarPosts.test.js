import createTest from 'platform/createTest';
import merge from 'platform/merge';

import similarPosts from './similarPosts';
import * as similarPostsActions from 'app/actions/similarPosts';

createTest({ reducers: { similarPosts } }, ({ getStore, expect }) => {
  describe('similarPosts', () => {
    describe('RECEIVED_SIMILAR_POSTS', () => {
      it('should update state with recommended posts', () => {
        const POST_ID = 'abc123';
        const REC_POST_LIST = [{ 'uuid': 't3_1' }, { 'uuid': 't3_2' }];

        const { store } = getStore({
          similarPosts: null,
        });

        store.dispatch(similarPostsActions.received(
          POST_ID,
          { results: REC_POST_LIST, response: { status: 200 } },
        ));

        const { similarPosts } = store.getState();
        expect(similarPosts).to.eql(merge(similarPosts, {
          [POST_ID]: ['t3_1', 't3_2'],
        }));

      });
    });
  });
});
