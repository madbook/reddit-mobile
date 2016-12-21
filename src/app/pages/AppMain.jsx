import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { UrlSwitch, Page } from '@r/platform/url';

import CommentsPage from './Comments';
import { SUPPORTED_SORTS } from 'app/sortValues';
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
import Login from 'app/components/Login';
import Messages from 'app/components/Messages';
import MessageThread from 'app/components/MessageThread';
import ModalSwitch from 'app/components/ModalSwitch';
import PostSubmitCommunityModal from 'app/components/PostSubmitCommunityModal';
import PostSubmitModal from 'app/components/PostSubmitModal';
import Register from 'app/components/Register';
import Toaster from 'app/components/Toaster';
import NavFrame from 'app/components/NavFrame';

const SORTS = SUPPORTED_SORTS.join('|');

const selector = createSelector(
  state => state.platform.currentPage,
  state => state.toaster.isOpen,
  state => !!state.widgets.tooltip.id,
  state => state.posting.showCaptcha,
  state => !!state.modal.type,
  (
    currentPage,
    isToasterOpen,
    isTooltipOpen,
    isCaptchaOpen,
    isModalOpen,
  ) => {
    return {
      isModalOpen,
      isToasterOpen,
      showDropdownCover: isTooltipOpen || isCaptchaOpen || isModalOpen,
      url: currentPage.url,
      referrer: currentPage.referrer,
      statusCode: currentPage.status,
    };
  }
);

const FramedPage = props => {
  const { component } = props;

  const wrappedComponent = props => {
    return (
      <NavFrame>
        { React.createElement(component, props) }
      </NavFrame>
    );
  };

  return <Page { ...{...props, component: wrappedComponent } } />;
};


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
      <div className='AppMainPage'>
        <NavFrame
            showInterstitial={ false }
            showDualPartInterstitial={ false }
            showSmartBanner={ false }
        >
          <ErrorPage status={ statusCode } url={ url } referrer={ referrer } />
        </NavFrame>
      </div>
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
        <FramedPage url='/' component={ PostsFromSubredditPage } />
        <FramedPage url={ `/:sort(${SORTS})` } component={ PostsFromSubredditPage } />
        <FramedPage url='/r/:subredditName' component={ PostsFromSubredditPage } />
        <FramedPage
            url={ `/r/:subredditName/:sort(${SORTS})` }
            component={ PostsFromSubredditPage }
        />
        <FramedPage
            url='/r/:subredditName/comments/:postId/comment/:commentId'
            component={ CommentsPage }
        />
        <FramedPage
            url='/r/:subredditName/comments/:postId/:postTitle/:commentId'
            component={ CommentsPage }
        />
        <FramedPage
            url='/r/:subredditName/comments/:postId/:postTitle?'
            component={ CommentsPage }
        />
        <FramedPage url='/search' component={ SearchPage } />
        <FramedPage url='/r/:subredditName/search' component={ SearchPage } />
        <FramedPage url='/r/:subredditName/about' component={ SubredditAboutPage } />
        <FramedPage url='/r/:subredditName/(w|wiki)/:path(.*)?' component={ WikiPage } />
        <FramedPage url='/(help|w|wiki)/:path(.*)?' component={ WikiPage } />
        <FramedPage
            url='/comments/:postId/:postTitle/:commentId'
            component={ CommentsPage }
        />
        <FramedPage url='/comments/:postId/:postTitle?' component={ CommentsPage } />
        <FramedPage url='/user/:userName/activity' component={ UserActivityPage } />
        <FramedPage url='/user/:userName/comments' component={ UserActivityPage } />
        <FramedPage url='/user/:userName/submitted' component={ UserActivityPage } />
        <FramedPage url='/user/:userName/gild' component={ UserProfilePage } />
        <FramedPage
            url='/user/:userName/:savedOrHidden(saved|hidden)'
            component={ SavedAndHiddenPage }
        />
        <FramedPage url='/user/:userName/' component={ UserProfilePage } />
        <FramedPage url='/message/compose' component={ DirectMessage } />
        <FramedPage url='/message/:mailType' component={ Messages } />
      </UrlSwitch>
      { showDropdownCover ? <DropdownCover /> : null }
      { isToasterOpen ? <Toaster /> : null }
      { isModalOpen ? <ModalSwitch /> : null }
    </div>
  );
};

export default connect(selector)(AppMain);
