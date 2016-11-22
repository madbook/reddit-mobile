import './styles.less';
import React from 'react';
import { Anchor } from '@r/platform/components';
import { models } from '@r/api-client';
import { TooltipTarget } from '@r/widgets/tooltip';

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
    if (post.disable_comments) {
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

  render() {
    const {
      post,
      compact,
      hideDownvote,
      user,
      onToggleEdit,
      onToggleSave,
      onToggleHide,
      onReportPost,
      single,
    } = this.props;

    const isLoggedIn = user && !user.loggedOut;
    const canModify = single && isLoggedIn && user.name === post.author;

    const scoreHidden = post.hideScore || post.score_hidden; // XXX when does a post have score_hidden?
    return (
      <footer className={ `PostFooter ${compact ? 'size-compact' : ''}` }>
        { this.renderCommentsLink(post) }
        <div className='PostFooter__vote-and-tools-wrapper'>
          <TooltipTarget
            id={ post.name }
            type={ TooltipTarget.TYPE.CLICK }
          >
            <div className='PostFooter__dropdown-button PostFooter__hit-area icon icon-seashells'/>
          </TooltipTarget>
          <span className='PostFooter__vertical-divider' />
          <VotingBox
            thingId = { post.name }
            score={ post.score }
            scoreHidden={ scoreHidden }
            voteDirection={ post.likes }
            hideDownvote={ hideDownvote }
          />
        </div>
        <PostDropdown
          id={ post.name }
          canModify={ canModify }
          permalink={ post.cleanPermalink }
          subreddit={ post.subreddit }
          author={ post.author }
          isSaved={ post.saved }
          isLoggedIn={ isLoggedIn }
          onToggleEdit={ onToggleEdit }
          onToggleSave={ onToggleSave }
          onToggleHide={ onToggleHide }
          onReportPost={ onReportPost }
        />
      </footer>
    );
  }
}
