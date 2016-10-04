import createTest from '@r/platform/createTest';

import * as commentActions from 'app/actions/comment';
import * as loginActions from 'app/actions/login';
import * as postActions from 'app/actions/posts';

import editingText, { DEFAULT_STATE } from './editingText';

createTest({ reducers: { editingText }}, ({ getStore, expect}) => {
  describe('editingText', () => {
    describe('LOGGED_IN and LOGGED_OUT', () => {
      it('should return default on log out', () => {
        const { store } = getStore({
          editingText: {
            t1_1234: { pending: true, error: null },
          },
        });

        store.dispatch(loginActions.loggedOut());
        const { editingText } = store.getState();
        expect(editingText).to.eql(DEFAULT_STATE);
      });

      it('should return default on log in', () => {
        const { store } = getStore({
          editingText: {
            t1_1234: { pending: true, error: null },
          },
        });

        store.dispatch(loginActions.loggedIn());
        const { editingText } = store.getState();
        expect(editingText).to.eql(DEFAULT_STATE);
      });
    });

    describe('TOGGLE', () => {
      it('should add a new entry when toggling', () => {
        [
          postActions.toggleEdit,
          commentActions.toggleEdit,
        ].forEach(actionCreator => {
          const { store } = getStore();

          const ID = 'test';
          const EXPECTED = {
            pending: false,
            error: null,
          };

          store.dispatch(actionCreator(ID));
          const { editingText } = store.getState();
          expect(editingText[ID]).to.eql(EXPECTED);
        });
      });
    });

    describe('UPDATING', () => {
      it('should set pending true when editing starts', () => {
        [
          postActions.updatingSelfText,
          commentActions.updatingBody,
        ].forEach(actionCreator => {
          const { store } = getStore();

          const ID = 'test';
          const EXPECTED = {
            pending: true,
            error: null,
          };

          store.dispatch(actionCreator(ID));
          const { editingText }= store.getState();
          expect(editingText[ID]).to.eql(EXPECTED);
        });
      });
    });

    describe('UPDATED', () => {
      it('should remove editing objects from state when the edit is finished', () => {
        [
          postActions.updatedSelfText,
          commentActions.updatedBody,
        ].forEach(actionCreator => {
          const ID = 'test';
          const { store } = getStore({
            editingText: {
              [ID]: {
                pending: true,
                error: null,
              },
            },
          });

          store.dispatch(actionCreator({ uuid: ID }));
          const { editingText } = store.getState();
          expect(editingText[ID]).to.eql(undefined);
        });
      });
    });

    describe('FAILED', () => {
      it('should set error states when an operation failed', () => {
        [
          postActions.failedUpdateSelfText,
          commentActions.failedUpdateBody,
        ].forEach(actionCreator => {
          const ID = 'test';
          const ERROR = new Error('testing');
          const { store } = getStore({
            editingText: {
              [ID]: {
                pending: true,
                error: null,
              },
            },
          });

          store.dispatch(actionCreator(ID, ERROR));
          const { editingText } = store.getState();
          expect(editingText[ID]).to.eql({
            pending: false,
            error: ERROR,
          });
        });
      });
    });
  });
});
