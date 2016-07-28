import createTest from '@r/platform/createTest';

import scrollPositions, { DEFAULT } from './scrollPositions';
import * as loginActions from 'app/actions/login';
import * as scrollPositionActions from 'app/actions/scrollPosition';

createTest({ reducers: { scrollPositions }}, ({ getStore, expect }) => {
  describe('scrollPositions', () => {
    describe('LOGGED_IN and LOGGED_OUT', () => {
      it('should return default on log out', () => {
        const { store } = getStore({
          scrollPositions: {
            '/r/javascript': 1337,
          },
        });

        store.dispatch(loginActions.loggedOut());
        const { scrollPositions } = store.getState();
        expect(scrollPositions).to.eql(DEFAULT);
      });

      it('should return the default on log in', () => {
        const { store } = getStore({
          scrollPositions: {
            '/r/javascript': 1337,
          },
        });

        store.dispatch(loginActions.loggedIn());
        const { scrollPositions } = store.getState();
        expect(scrollPositions).to.eql(DEFAULT);
      });
    });

    describe('SAVE_SCROLL_POSITION', () => {
      it('should save scroll positions', () => {
        const { store } = getStore();

        const url = 'r/javascript';
        const scrollPosition = 1337;

        store.dispatch(scrollPositionActions.save(url, scrollPosition));
        const { scrollPositions } = store.getState();
        expect(scrollPositions).to.eql({
          [url]: scrollPosition,
        });
      });

      it('should overwrite new scroll positions', () => {
        const url = 'r/javascript';
        const oldScrollPosition = 1337;

        const { store } = getStore({
          scrollPositions: {
            [url]: oldScrollPosition,
          },
        });

        const newScrollPosition = 9001;
        store.dispatch(scrollPositionActions.save(url, newScrollPosition));
        const { scrollPositions } = store.getState();
        expect(scrollPositions).to.eql({
          [url]: newScrollPosition,
        });
      });
    });
  });
});
