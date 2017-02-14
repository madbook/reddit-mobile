import range from 'lodash/range';
import createTest from '@r/platform/createTest';

import { VISITED_POSTS_COUNT } from 'app/constants';

import visitedPosts from './visitedPosts';
import * as commentsPageActions from 'app/actions/commentsPage';

createTest({ reducers: { visitedPosts } }, ({ getStore, expect }) => {
  describe('visitedPosts', () => {
    it('should default to an empty array', () => {
      const { store } = getStore();
      const { visitedPosts } = store.getState();
      expect(visitedPosts).to.eql([]);
    });

    describe('VISITED_COMMENTS_PAGE', () => {
      it('should record visited posts', () => {
        const id = 'abc123';

        const { store } = getStore();
        store.dispatch(commentsPageActions.visitedCommentsPage(id));

        const { visitedPosts } = store.getState();
        expect(visitedPosts).to.eql([id]);
      });

      it('should limit the number of visited posts recorded', () => {
        const baseId = 'abc123';
        const { store } = getStore();

        const ids = range(0, VISITED_POSTS_COUNT + 1).map(i => `${baseId}${i}`);
        ids.forEach(id => {
          store.dispatch(commentsPageActions.visitedCommentsPage(id));
          const { visitedPosts } = store.getState();
          expect(visitedPosts.length).to.be.at.most(VISITED_POSTS_COUNT);
        });

        expect(visitedPosts[0]).to.eql(ids[ids.length]);
      });
    });
  });
});
