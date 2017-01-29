import createTest from 'platform/createTest';
import wikis from './wikis';
import * as wikiActions from 'app/actions/wiki';
import * as loginActions from 'app/actions/login';

createTest({ reducers: { wikis } }, ({ getStore, expect }) => {
  describe('wikis', () => {
    describe('LOGGED_IN and LOGGED_OUT', () => {
      it('should return default on log out', () => {
        const { store } = getStore({
          wikis: {
            'wiki/faq': { contentHTML: 'READ ME' },
          },
        });

        store.dispatch(loginActions.loggedOut());
        const { wikis } = store.getState();
        expect(wikis).to.eql({});
      });

      it('should return the default on log in', () => {
        const { store } = getStore({
          wikis: {
            'wiki/faq': { contentHTML: 'READ ME' },
          },
        });

        store.dispatch(loginActions.loggedIn());
        const { wikis } = store.getState();
        expect(wikis).to.eql({});
      });
    });

    describe('RECEIVED_WIKI', () => {
      it('should pull wikis models out of wikiActions.received', () => {
        const { store } = getStore();

        const WIKI = {
          uuid: 'wiki/faq',
        };

        store.dispatch(wikiActions.received({}, {
          wikis: {
            [WIKI.uuid]: WIKI,
          },
        }));

        const { wikis } = store.getState();
        expect(wikis).to.eql({
          [WIKI.uuid]: WIKI,
        });
      });
    });
  });
});
