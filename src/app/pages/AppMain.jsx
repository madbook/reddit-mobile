import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { UrlSwitch, Page } from '@r/platform/url';

import { CommentsPage } from './Comments';
import { PostsFromSubredditPage } from './PostsFromSubreddit';
import { SavedAndHiddenPage } from './SavedAndHidden';
import { SearchPage } from './SearchPage';
import { SubredditAboutPage } from './SubredditAbout';
import { UserActivityPage } from './UserActivity';
import { UserProfilePage } from './UserProfile';
import { WikiPage } from './WikiPage';

import Messages from 'app/components/Messages';
import MessageThread from 'app/components/MessageThread';
import DirectMessage from 'app/components/DirectMessage';
import Login from 'app/components/Login';
import Register from 'app/components/Register';
import ErrorPage from 'app/components/ErrorPage';
import Toaster from 'app/components/Toaster';
import ModalSwitch from 'app/components/ModalSwitch';
import DropdownCover from 'app/components/DropdownCover';

const AppMain = props => {

  const {
    statusCode,
    url,
    referrer,
    isToasterOpen,
    isModalOpen,
    showDropdownCover,
  } = props;

  if (statusCode !== 200) {
    return (
      <ErrorPage status={ statusCode } url={ url } referrer={ referrer } />
    );
  }

  return (
    <div className='AppMainPage'>
      <UrlSwitch>
        <Page
          url='/'
          component={ PostsFromSubredditPage }
        />
        <Page
          url='/r/:subredditName'
          component={ PostsFromSubredditPage }
        />
        <Page
          url='/r/:subredditName/comments/:postId/comment/:commentId'
          component={ CommentsPage }
        />
        <Page
          url='/r/:subredditName/comments/:postId/:postTitle/:commentId'
          component={ CommentsPage }
        />
        <Page
          url='/r/:subredditName/comments/:postId/:postTitle?'
          component={ CommentsPage }
        />
        <Page url='/search' component={ SearchPage } />
        <Page url='/r/:subredditName/search' component={ SearchPage } />
        <Page url='/r/:subredditName/about' component={ SubredditAboutPage } />
        <Page url='/r/:subredditName/(w|wiki)/:path(.*)?' component={ WikiPage } />
        <Page url='/(help|w|wiki)/:path(.*)?' component={ WikiPage } />
        <Page
          url='/comments/:postId/:postTitle/:commentId'
          component={ CommentsPage }
        />
        <Page
          url='/comments/:postId/:postTitle?'
          component={ CommentsPage }
        />
        <Page url='/user/:userName/activity' component={ UserActivityPage } />
        <Page url='/user/:userName/gild' component={ UserProfilePage } />
        <Page url='/user/:userName/:savedOrHidden(saved|hidden)' component={ SavedAndHiddenPage } />
        <Page url='/user/:userName/' component={ UserProfilePage } />
        <Page url='/login' component={ Login } />
        <Page url='/register' component={ Register } />
        <Page url='/message/compose' component={ DirectMessage } />
        <Page url='/message/:mailType' component={ Messages } />
        <Page url='/message/messages/:threadId' component={ MessageThread } />
      </UrlSwitch>

      { showDropdownCover ? <DropdownCover /> : null }
      { isToasterOpen ? <Toaster /> : null }
      { isModalOpen ? <ModalSwitch /> : null }
  </div>
  );
};

const selector = createSelector(
  state => state.platform.currentPage,
  state => state.toaster.isOpen,
  state => !!state.widgets.tooltip.id,
  state => !!state.posting.captchaIden,
  state => !!state.modal.type,
  (currentPage, isToasterOpen, isTooltipOpen, isCaptchaOpen, isModalOpen) => ({
    isModalOpen,
    isToasterOpen,
    showDropdownCover: isTooltipOpen || isCaptchaOpen || isModalOpen,
    url: currentPage.url,
    referrer: currentPage.referrer,
    statusCode: currentPage.status,
  })
);

export default connect(selector)(AppMain);
