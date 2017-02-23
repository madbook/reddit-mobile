import merge from 'platform/merge';
import * as loginActions from 'app/actions/login';
import * as commentsPageActions from 'app/actions/commentsPage';
import * as postsListActions from 'app/actions/postsList';
import * as reportingActions from 'app/actions/reporting';

export const USER_REPORT_KEY = 'USER_REPORTS';
export const MODERATOR_REPORT_KEY = 'MOD_REPORTS';
const DEFAULT = {};

// This function arranges modReports and userReports into an object
// instead of arrays
const formatReports = (modelList) => {
  const reports = {};

  for (var key in modelList) {
    modelList[key].userReports.forEach(function(report) {
      // { USER_REPORTS: { 'spam': 5, 'illegal': 2 }}
      if (!reports[key]) {
        reports[key] = {
          [USER_REPORT_KEY]: {},
        };
      }

      reports[key][USER_REPORT_KEY] = {
        [report[0]]: report[1],
      };
    });

    modelList[key].modReports.forEach(function(report) {
      // { MOD_REPORTS: { 'toasties': 'spam', 'madlee': 'illegal' }}
      if (!reports[key]) {
        reports[key] = {
          [MODERATOR_REPORT_KEY]: {},
        };
      }

      reports[key][MODERATOR_REPORT_KEY] = {
        [report[1]]: report[0],
      };
    });
  }

  return reports;
};

export default (state=DEFAULT, action={}) => {
  switch (action.type) {
    case loginActions.LOGGED_IN:
    case loginActions.LOGGED_OUT: {
      return DEFAULT;
    }

    case reportingActions.SUCCESS: {
      const { model, report, username, moderatesSub } = action;

      if (!moderatesSub) { return DEFAULT; }

      return merge(state, {
        [model.name]: {
          [MODERATOR_REPORT_KEY]: {
            [username]: report.reason,
          },
        },
      });
    }

    case postsListActions.RECEIVED_POSTS_LIST: {
      const { posts } = action.apiResponse;
      const reports = formatReports(posts);

      return merge(
        state,
        reports,
      );
    }

    case commentsPageActions.RECEIVED_COMMENTS_PAGE: {
      const { comments } = action.payload;
      const reports = formatReports(comments);

      return merge(
        state,
        reports,
      );
    }

    default: {
      return state;
    }
  }
};
