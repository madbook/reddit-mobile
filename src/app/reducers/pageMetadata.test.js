import createTest from 'platform/createTest';
import * as platformActions from 'platform/actions';
import { SET_TITLE } from 'app/actions/pageMetadata';

import pageMetadata from './pageMetadata';
import { DEFAULT } from './pageMetadata';

createTest({ reducers: { pageMetadata } }, ({ expect }) => {
  describe('pageMetadata', () => {
    describe('Page changes (page_index, navigate)', () => {
      it('should reset the title to default on pageIndex', () => {
        const data = pageMetadata({
          title: 'whatever',
        }, {
          type: platformActions.GOTO_PAGE_INDEX,
        });

        expect(data).to.equal(DEFAULT);
      });

      it('should reset the title to default on navigate', () => {
        const data = pageMetadata({
          title: 'whatever',
        }, {
          type: platformActions.NAVIGATE_TO_URL,
        });

        expect(data).to.equal(DEFAULT);
      });
    });

    describe('Title changes)', () => {
      it('uses the default if the title is not defined', () => {
        const data = pageMetadata({
          title: 'hi',
        }, {
          type: SET_TITLE,
        });

        expect(data).to.equal(DEFAULT);
      });

      it('uses the title if the title is defined', () => {
        const newTitle = 'new title';

        const data = pageMetadata({
          title: 'hi',
        }, {
          type: SET_TITLE,
          title: newTitle,
        });

        expect(data.title).to.equal(newTitle);
      });
    });
  });
});
