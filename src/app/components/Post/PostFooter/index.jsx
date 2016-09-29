import './styles.less';
import React from 'react';
import { Anchor } from '@r/platform/components';
import { models } from '@r/api-client';
import { TooltipTarget } from '@r/widgets/tooltip';

import PostDropdown from '../PostDropdown';
import Vote from 'app/components/Vote';

const { PostModel } = models;

const T = React.PropTypes;

export default class PostFooter extends React.Component {
  static propTypes = {
    user: T.object,
    single: T.bool.isRequired,
    compact: T.bool.isRequired,
    post: T.instanceOf(PostModel),
    viewComments: T.bool.isRequired,
    onToggleSave: T.func.isRequired,
    onToggleHide: T.func.isRequired,
    onReportPost: T.func.isRequired,
    onHide: T.func.isRequired,
    onEdit: T.func.isRequired,
    onDelete: T.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.onScoreChanged = this.onScoreChanged.bind(this);
    this.onOpenDropdown = this.onOpenDropdown.bind(this);
    this.onDropdownClosed = this.onDropdownClosed.bind(this);
    this.onScoreChanged = this.onScoreChanged.bind(this);
    this.onUpVote = this.onVote.bind(this, 1);
    this.onDownVote = this.onVote.bind(this, -1);

    this.mounted = false; // not state as setState calls for updating
    // would force a re-render. We want this to make sure animations
    // are only rendered on the client _after_ the first render
    // so there are no bounces when you go between pages
  }

  componentDidMount() {
    this.mounted = true;
  }

  onOpenDropdown(e) {
    this.setState({ dropdownTarget: e.target });
  }

  onDropdownClosed() {
    this.setState({ dropdownTarget: null });
  }

  onScoreChanged(/*voteController*/) {
    // this.setState({
    //   score: voteController.score,
    //   voteDirection: voteController.voteDirection,
    // });
  }

  onVote(/*direction*/) {
    // this.voteController.userCastVote(direction);
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
      onToggleSave,
      onToggleHide,
      onReportPost,
    } = this.props;

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
          <Vote
            thingId = { post.name }
            classPrefix='PostFooter'
            score={ post.score }
            scoreHidden={ scoreHidden }
            voteDirection={ post.likes }
            onUpvote={ this.onUpvote }
            hideDownvote={ hideDownvote }
          />
        </div>
        <PostDropdown
          id={ post.name }
          permalink={ post.cleanPermalink }
          subreddit={ post.subreddit }
          author={ post.author }
          isSaved={ post.saved }
          isLoggedIn={ user && !user.loggedOut }
          onToggleSave={ onToggleSave }
          onToggleHide={ onToggleHide }
          onReportPost={ onReportPost }
        />
      </footer>
    );
  }
}
