import createTest from '@r/platform/createTest';

import collapsedComments from './collapsedComments';
import * as commentActions from 'app/actions/comment';
import * as loginActions from 'app/actions/login';

createTest({ reducers: { collapsedComments } }, ({ getStore, expect }) => {
  describe('collapsedComments', () => {
    describe('LOGGED_IN and LOGGED_OUT', () => {
      it('should return default on log in', () => {
        const { store } = getStore();
        store.dispatch(loginActions.loggedIn());

        const { collapsedComments } = store.getState();
        expect(collapsedComments).to.eql({});
      });

      it('should return default on log out', () => {
        const { store } = getStore();
        store.dispatch(loginActions.loggedOut());

        const { collapsedComments } = store.getState();
        expect(collapsedComments).to.eql({});
      });
    });

    describe('TOGGLE_COLLAPSE', () => {
      const ID = '1';

      it('should set a comments collapse state to true when the actions collapse is true', () => {
        const { store } = getStore();
        store.dispatch(commentActions.toggleCollapse(ID, true));

        const { collapsedComments } = store.getState();
        expect(collapsedComments).to.have.keys(ID);
        expect(collapsedComments[ID]).to.equal(true);
      });

      it('should set a comments collapse state to false when the actions collapse is false', () => {
        const { store } = getStore();
        store.dispatch(commentActions.toggleCollapse(ID, false));

        const { collapsedComments } = store.getState();
        expect(collapsedComments).to.have.keys(ID);
        expect(collapsedComments[ID]).to.equal(false);
      });
    });

    describe('RESET_COLLAPSE', () => {
      it('should reset the collapse state of all comments', () => {
        const { store } = getStore();
        store.dispatch(commentActions.resetCollapse({}));

        const { collapsedComments } = store.getState();
        expect(collapsedComments).to.eql({});
      });
    });
  });
});
