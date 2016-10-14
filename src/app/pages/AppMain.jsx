import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { UrlSwitch, Page, Case } from '@r/platform/url';

import { CommentsPage } from './Comments';
import { PostsFromSubredditPage } from './PostsFromSubreddit';
import { SavedAndHiddenPage } from './SavedAndHidden';
import { SearchPage } from './SearchPage';
import { SubredditAboutPage } from './SubredditAbout';
import { UserActivityPage } from './UserActivity';
import { UserProfilePage } from './UserProfile';
import { WikiPage } from './WikiPage';


import DirectMessage from 'app/components/DirectMessage';
import DropdownCover from 'app/components/DropdownCover';
import ErrorPage from 'app/components/ErrorPage';
import EUCookieNotice from 'app/components/EUCookieNotice';
import Login from 'app/components/Login';
import Messages from 'app/components/Messages';
import MessageThread from 'app/components/MessageThread';
import ModalSwitch from 'app/components/ModalSwitch';
import PostSubmitCommunityModal from 'app/components/PostSubmitCommunityModal';
import PostSubmitModal from 'app/components/PostSubmitModal';
import Register from 'app/components/Register';
import SmartBanner from 'app/components/SmartBanner';
import Toaster from 'app/components/Toaster';
import TopNav from 'app/components/TopNav';

const AppMain = props => {

  const {
    statusCode,
    url,
    referrer,
    isToasterOpen,
    isModalOpen,
    showDropdownCover,
    showSmartBanner,
  } = props;

  if (statusCode !== 200) {
    return (
      <ErrorPage status={ statusCode } url={ url } referrer={ referrer } />
    );
  }

  return (
    <div className='AppMainPage'>
      <UrlSwitch>
        <Page url='/login' component={ Login } />
        <Page url='/register' component={ Register } />
        <Page url='/message/messages/:threadId' component={ MessageThread } />
        <Page url='/r/:subredditName/submit' component={ PostSubmitModal } />
        <Page url='/submit' component={ PostSubmitModal } />
        <Page url='/submit/to_community' component={ PostSubmitCommunityModal } />
        <Case url='*' exec={ () => {
          // In Essence this is a nested router to facilitate adding UI that sits
          // above all page's content. At the moment that's TopNav and EUCookieNotice
          // In the interest of time this was implemented manually using the
          // `Case` statement. A better solution would be to have an
          //  a component that renders the App's 'frame' (TopNav, EUCookieNotice, etc)
          // and each page could manually use that component to wrap its content.
          // Another solution would be to have first class support for nested
          // routes in r/platform. Both of these will be investigated
          return (
            <div>
              <TopNav />
              <div className='BelowTopNav'>
                <EUCookieNotice />
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
                  <Page
                    url='/user/:userName/:savedOrHidden(saved|hidden)'
                    component={ SavedAndHiddenPage }
                  />
                  <Page url='/user/:userName/' component={ UserProfilePage } />
                  <Page url='/message/compose' component={ DirectMessage } />
                  <Page url='/message/:mailType' component={ Messages } />
                </UrlSwitch>
              </div>
            </div>
          );
        } } />
      </UrlSwitch>
      { showDropdownCover ? <DropdownCover /> : null }
      { isToasterOpen ? <Toaster /> : null }
      { isModalOpen ? <ModalSwitch /> : null }
      { showSmartBanner ? <SmartBanner /> : null }
    </div>
  );
};

const selector = createSelector(
  state => state.platform.currentPage,
  state => state.toaster.isOpen,
  state => !!state.widgets.tooltip.id,
  state => !!state.posting.captchaIden,
  state => !!state.modal.type,
  state => state.smartBanner.showBanner,
  (
    currentPage,
    isToasterOpen,
    isTooltipOpen,
    isCaptchaOpen,
    isModalOpen,
    showSmartBanner
  ) => ({
    isModalOpen,
    isToasterOpen,
    showSmartBanner,
    showDropdownCover: isTooltipOpen || isCaptchaOpen || isModalOpen,
    url: currentPage.url,
    referrer: currentPage.referrer,
    statusCode: currentPage.status,
  })
);

export default connect(selector)(AppMain);
