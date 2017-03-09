import './styles.less';
import React from 'react';

import { Anchor } from 'platform/components';
import PostModel from 'apiClient/models/PostModel';
import PostDropdown from '../PostDropdown';
import VotingBox from 'app/components/VotingBox';
import InterceptableModalTarget from 'app/components/InterceptableModalTarget';

import { LISTING_CLICK_TYPES } from 'app/constants';

const T = React.PropTypes;


export default class PostFooter extends React.Component {
  static propTypes = {
    user: T.object,
    single: T.bool.isRequired,
    compact: T.bool.isRequired,
    post: T.instanceOf(PostModel),
    viewComments: T.bool.isRequired,
    onToggleEdit: T.func.isRequired,
    onToggleHide: T.func.isRequired,
    onReportPost: T.func.isRequired,
    onHide: T.func.isRequired,
    onEdit: T.func.isRequired,
    onDelete: T.func.isRequired,
    onToggleSave: T.func.isRequired,
    onElementClick: T.func.isRequired,
    onToggleModal: T.func.isRequired,
    isSubredditModerator: T.bool.isRequired,
    interceptListingClick: T.bool.isRequired,
  };

  constructor(props) {
    super(props);

    this.onOpenDropdown = this.onOpenDropdown.bind(this);
    this.onDropdownClosed = this.onDropdownClosed.bind(this);
  }

  onOpenDropdown(e) {
    this.setState({ dropdownTarget: e.target });
  }

  onDropdownClosed() {
    this.setState({ dropdownTarget: null });
  }

  renderCommentsLink(post, interceptListingClick) {
    if (post.disableComments) {
      return;
    }

    const { numComments } = post;

    return (
      <Anchor
        className='PostFooter__hit-area PostFooter__comments-link'
        href={ post.cleanPermalink }
        onClick={ e => {
          if (interceptListingClick(e, LISTING_CLICK_TYPES.COMMENTS_LINK)) {
            return;
          }

          this.props.onElementClick(e);
        } }
      >
        <span className='PostFooter__comments-icon icon icon-comment' />
        { this.numCommentsText(numComments) }
      </Anchor>
    );
  }

  numCommentsText(numberOfComments) {
    if (numberOfComments === 0) {
      return 'No Comments';
    } else if (numberOfComments === 1) {
      return '1 Comment';
    }

    return `${numberOfComments} Comments`;
  }

  renderDropdown(props, showModModal, modModalId, reportModalId) {
    const {
      post,
      user,
      onToggleEdit,
      onToggleSave,
      onToggleHide,
      onReportPost,
      single,
      onToggleModal,
      isSubredditModerator,
      reports,
    } = props;

    const isLoggedIn = user && !user.loggedOut;
    const canModify = single && isLoggedIn && user.name === post.author;

    return (
      <PostDropdown
        id={ post.name }
        canModify={ canModify }
        permalink={ post.cleanPermalink }
        subreddit={ post.subreddit }
        author={ post.author }
        isSticky={ post.stickied }
        isSaved={ post.saved }
        isHidden={ post.hidden }
        isLoggedIn={ isLoggedIn }
        onToggleEdit={ onToggleEdit }
        onToggleSave={ onToggleSave }
        onToggleHide={ onToggleHide }
        onReportPost={ onReportPost }
        onToggleModal={ onToggleModal }
        isSubredditModerator={ isSubredditModerator }
        isRemoved={ post.removed }
        isApproved={ post.approved }
        isSpam={ post.spam }
        isLocked={ post.locked }
        isNSFW={ post.over18 }
        isSpoiler={ post.spoiler }
        approvedBy={ post.approvedBy }
        removedBy={ post.bannedBy }
        showModModal={ showModModal }
        modModalId={ modModalId }
        distinguishType={ post.distinguished }
        isMine={ user && user.name === post.author }
        reports={ reports }
        reportModalId={ reportModalId }
      />
    );
  }

  render() {
    const {
      post,
      compact,
      hideDownvote,
      isSubredditModerator,
      interceptListingClick,
    } = this.props;


    const modModalId = `mod-${post.name}`;
    const reportModalId = `report-${post.name}`;
    const scoreHidden = post.hideScore || post.score_hidden; // XXX when does a post have score_hidden?
    return (
      <footer
        className={ `PostFooter ${compact ? 'size-compact' : ''}` }
        onClick={ e => interceptListingClick(e, LISTING_CLICK_TYPES.FOOTER) }
      >
        { this.renderCommentsLink(post, interceptListingClick) }
        <div className='PostFooter__vote-and-tools-wrapper'>
          <InterceptableModalTarget
            id={ post.name }
            interceptClick={ e => interceptListingClick(e, LISTING_CLICK_TYPES.FOOTER_DROPDOWN) }
          >
            <div className='PostFooter__dropdown-button PostFooter__hit-area icon icon-seashells'/>
          </InterceptableModalTarget>
          { isSubredditModerator
            ? (
            <InterceptableModalTarget
              id={ modModalId }
              interceptClick={ e => interceptListingClick(e, LISTING_CLICK_TYPES.MOD_SHIELD) }
            >
              <div className='PostFooter__dropdown-button PostFooter__hit-area icon icon-mod'/>
            </InterceptableModalTarget>)
            : null
          }
          <span className='PostFooter__vertical-divider' />
          <VotingBox
            thingId = { post.name }
            score={ post.score }
            scoreHidden={ scoreHidden }
            voteDirection={ post.likes }
            hideDownvote={ hideDownvote }
            interceptVote={ e => interceptListingClick(e, LISTING_CLICK_TYPES.VOTE_CONTROLS) }
          />
        </div>
        { this.renderDropdown(this.props, false, null) }
        { isSubredditModerator ? this.renderDropdown(this.props, true, modModalId, reportModalId) : null }
      </footer>
    );
  }
}
