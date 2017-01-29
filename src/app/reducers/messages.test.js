import createTest from 'platform/createTest';
import messages from './messages';
import * as loginActions from 'app/actions/login';
import * as mailActions from 'app/actions/mail';

createTest({ reducers: { messages } }, ({ getStore, expect }) => {
  describe('messages', () => {
    describe('LOGGED_IN and LOGGED_OUT', () => {
      it('should return default on log out', () => {
        const { store } = getStore({
          messages: { t4_1: {} },
        });

        store.dispatch(loginActions.loggedOut());
        const { messages } = store.getState();
        expect(messages).to.eql({});
      });

      it('should return the default on log in', () => {
        const { store } = getStore({
          messages: { t4_1: {} },
        });

        store.dispatch(loginActions.loggedIn());
        const { messages } = store.getState();
        expect(messages).to.eql({});
      });
    });

    describe('RECEIVING MESSAGES', () => {
      it('should pull messages from all expected sources', () => {
        const { store } = getStore();
        const message = {
          uuid: 't4_1',
          subreddit: 'mwebisboss',
        };

        store.dispatch(mailActions.setInboxSuccess('', {
          messages: {
            [message.uuid]: message,
          },
        }));

        expect(store.getState().messages).to.eql({
          [message.uuid]: message,
        });
      });
    });

    describe('ADDING REPLY', () => {
      it('should add a message', () => {
        const { store } = getStore();
        const message = {
          uuid: 't4_1',
          subreddit: 'mwebisboss',
        };

        store.dispatch(mailActions.addReply({
          messages: {
            [message.uuid]: message,
          },
        }));

        expect(store.getState().messages).to.eql({
          [message.uuid]: message,
        });
      });
    });
  });
});
