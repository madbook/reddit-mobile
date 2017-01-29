import createTest from 'platform/createTest';
import autocompleteSubreddits from './autocompleteSubreddits';
import * as subredditAutocompleteActions from 'app/actions/subredditAutocomplete';

createTest({ reducers: { autocompleteSubreddits } }, ({ expect, getStore }) => {
  describe('autocompleteSubreddits', () => {
    describe('FETCHING', () => {
      it('should set fetching to true', () => {
        const { store } = getStore();
        store.dispatch(subredditAutocompleteActions.fetching());

        const { autocompleteSubreddits } = store.getState();
        expect(autocompleteSubreddits.fetching).to.equal(true);
      });
    });

    describe('RECEIVED', () => {
      it('should set fetching to false', () => {
        const { store } = getStore();
        store.dispatch(subredditAutocompleteActions.received());

        const { autocompleteSubreddits } = store.getState();
        expect(autocompleteSubreddits.fetching).to.equal(false);
      });

      it('should set received to true', () => {
        const { store } = getStore();
        store.dispatch(subredditAutocompleteActions.received());

        const { autocompleteSubreddits } = store.getState();
        expect(autocompleteSubreddits.received).to.equal(true);
      });
    });

    describe('RESET', () => {
      it('should return the default', () => {
        const { store } = getStore();
        store.dispatch(subredditAutocompleteActions.reset());

        const { autocompleteSubreddits } = store.getState();
        expect(autocompleteSubreddits).to.eql({
          fetching: false,
          received: false,
          subredditNames: [],
        });
      });
    });
  });
});
