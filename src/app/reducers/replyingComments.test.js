import createTest from '@r/platform/createTest';

import replyingComments from './replyingComments';
import * as commentActions from 'app/actions/comment';
import * as loginActions from 'app/actions/login';
import * as replyActions from 'app/actions/reply';

createTest({ reducers: { replyingComments } }, ({ getStore, expect }) => {
  describe('replyingComments', () => {
    describe('LOGGED_IN and LOGGED_OUT', () => {
      it('should return default on log in', () => {
        const { store } = getStore({
          replyingComments: { t1_1: true },
        });
        store.dispatch(loginActions.loggedIn());

        const { replyingComments } = store.getState();
        expect(replyingComments).to.eql({});
      });

      it('should return default on log out', () => {
        const { store } = getStore({
          replyingComments: { t1_1: true },
        });
        store.dispatch(loginActions.loggedOut());

        const { replyingComments } = store.getState();
        expect(replyingComments).to.eql({});
      });
    });

    describe('TOGGLED_REPLY', () => {
      const ID = '1';

      it('should set a comments reply state to true when the actions reply is true', () => {
        const { store } = getStore();
        store.dispatch(commentActions.toggledReply(ID, true));

        const { replyingComments } = store.getState();
        expect(replyingComments).to.have.keys(ID);
        expect(replyingComments[ID]).to.equal(true);
      });

      it('should set a comments reply state to true when the actions reply is false', () => {
        const { store } = getStore();
        store.dispatch(commentActions.toggledReply(ID, false));

        const { replyingComments } = store.getState();
        expect(replyingComments).to.have.keys(ID);
        expect(replyingComments[ID]).to.equal(false);
      });
    });

    describe('RESET_REPLY', () => {
      it('should reset the reply state of all comments', () => {
        const { store } = getStore();
        store.dispatch(commentActions.resetReply({}));

        const { replyingComments } = store.getState();
        expect(replyingComments).to.eql({});
      });
    });

    describe('REPLIED', () => {
      it('should close the reply form when a reply response was received', () => {
        const id = 1;
        const text = '';

        const { store } = getStore();
        store.dispatch(commentActions.toggledReply(id, true));

        let { replyingComments } = store.getState();
        expect(replyingComments[id]).to.equal(true);

        store.dispatch(replyActions.replied(id, text));
        replyingComments = store.getState().replyingComments;
        expect(replyingComments[id]).to.be.undefined;
      });
    });
  });
});
