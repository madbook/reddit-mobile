import createTest from 'platform/createTest';
import * as rulesModalActions from 'app/actions/rulesModal';
import rulesModal from './rulesModal';

createTest({ reducers: { rulesModal }}, ({ getStore, expect }) => {
  describe('rulesModal', () => {
    describe('RULES_MODAL_ACCEPTED', () => {
      it('should add the subreddit and feature key to state', () => {
        const { store } = getStore({});

        const featureName = 'test';
        const subredditName = 'foo';
        const storeKey = rulesModalActions.getLocalStorageKey(featureName, subredditName);
        const expectedState = {
          [storeKey]: true,
        };
        
        store.dispatch(rulesModalActions.accept(featureName, subredditName));

        const { rulesModal } = store.getState();
        expect(rulesModal).to.eql(expectedState);
      });
    });
  });
});
