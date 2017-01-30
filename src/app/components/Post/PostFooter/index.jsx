import './styles.less';
import React from 'react';
import { Anchor } from '@r/platform/components';
import { models } from '@r/api-client';
import { ModalTarget } from '@r/widgets/modal';

import PostDropdown from '../PostDropdown';
import VotingBox from 'app/components/VotingBox';

const { PostModel } = models;

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

  renderCommentsLink(post) {
    if (post.disableComments) {
      return;
    }

    const { numComments } = post;

    return (
      <Anchor
        className='PostFooter__hit-area PostFooter__comments-link'
        href={ post.cleanPermalink }
        onClick = { this.props.onElementClick }
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

  renderDropdown(props, showModModal, modModalId) {
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
      />
    );
  }

  render() {
    const {
      post,
      compact,
      hideDownvote,
      isSubredditModerator,
    } = this.props;

    const modModalId = `mod-${post.name}`;
    const scoreHidden = post.hideScore || post.score_hidden; // XXX when does a post have score_hidden?
    return (
      <footer className={ `PostFooter ${compact ? 'size-compact' : ''}` }>
        { this.renderCommentsLink(post) }
        <div className='PostFooter__vote-and-tools-wrapper'>
          <ModalTarget
            id={ post.name }
          >
            <div className='PostFooter__dropdown-button PostFooter__hit-area icon icon-seashells'/>
          </ModalTarget>
          { isSubredditModerator
            ? (<ModalTarget
                id={ modModalId }
              >
                <div className='PostFooter__dropdown-button PostFooter__hit-area icon icon-mod'/>
              </ModalTarget>)
            : null
          }
          <span className='PostFooter__vertical-divider' />
          <VotingBox
            thingId = { post.name }
            score={ post.score }
            scoreHidden={ scoreHidden }
            voteDirection={ post.likes }
            hideDownvote={ hideDownvote }
          />
        </div>
        { this.renderDropdown(this.props, false, null) }
        { isSubredditModerator ? this.renderDropdown(this.props, true, modModalId) : null }
      </footer>
    );
  }
}
