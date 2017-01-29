import createTest from 'platform/createTest';
import expandedPosts from './expandedPosts';
import * as loginActions from 'app/actions/login';
import * as postActions from 'app/actions/posts';

createTest({ reducers: { expandedPosts }}, ({ getStore, expect }) => {
  describe('expandedPosts', () => {
    describe('LOGGED_IN and LOGGED_OUT', () => {
      it('should return the default on log in', () => {
        const { store } = getStore({
          expandedPosts: { t3_asdf: true },
        });

        store.dispatch(loginActions.loggedIn());
        const { expandedPosts } = store.getState();
        expect(expandedPosts).to.eql({});
      });

      it('should return the default on log out', () => {
        const { store } = getStore({
          expandedPosts: { t3_asdf: true },
        });

        store.dispatch(loginActions.loggedOut());
        const { expandedPosts } = store.getState();
        expect(expandedPosts).to.eql({});
      });
    });

    describe('TOGGLE_EXPANDED', () => {
      it('should set the expanded state of a post to true', () => {
        const id = 't3_asdf';
        const { store } = getStore();

        store.dispatch(postActions.toggleExpanded(id));
        const { expandedPosts } = store.getState();
        expect(expandedPosts).to.eql({ [id]: true });
      });

      it('should remove posts when they\'re already expanded', () => {
        const id = 't3_asdf';
        const { store } = getStore({
          expandedPosts: {
            [id]: true,
          },
        });

        store.dispatch(postActions.toggleExpanded(id));
        const { expandedPosts } = store.getState();
        expect(expandedPosts).to.eql({});
      });
    });
  });
});
