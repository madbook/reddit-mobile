import React from 'react';

import propTypes from '../../../propTypes';
import BaseComponent from '../BaseComponent';

import scoreText from '../../../lib/scoreText';

import PostDropdownController from './PostDropdownController';
import VoteableBehaviorComponent from '../behaviorcomponents/VoteableBehaviorComponent';

const T = React.PropTypes;
const VOTE_WRAPPER_CLS = 'PostFooter__vote-arrow-wrapper';

export default class PostFooter extends BaseComponent {
  static propTypes = {
    user: T.object,
    single: T.bool.isRequired,
    compact: T.bool.isRequired,
    post: propTypes.listing.isRequired,
    isArchived: T.bool,
    app: T.object.isRequired,
    token: T.string,
    apiOptions: T.object.isRequired,
    viewComments: T.bool.isRequired,
    onReport: T.func.isRequired,
    onHide: T.func.isRequired,
    onEdit: T.func.isRequired,
    onDelete: T.func.isRequired,
  };

  static defaultProps = {
    isArchived: false,
  };

  constructor(props) {
    super(props);

    this.onScoreChanged = this.onScoreChanged.bind(this);
    this.onOpenDropdown = this.onOpenDropdown.bind(this);
    this.onDropdownClosed = this.onDropdownClosed.bind(this);
    this.onScoreChanged = this.onScoreChanged.bind(this);
    this.onUpVote = this.onVote.bind(this, 1);
    this.onDownVote = this.onVote.bind(this, -1);
    this.onSave = this.onSave.bind(this);

    this.voteController = new VoteableBehaviorComponent(
      this.onScoreChanged,
      this.props.post,
      this.props.app,
      this.props.apiOptions,
    );

    this.mounted = false; // not state as setState calls for updating
    // would force a re-render. We want this to make sure animations
    // are only rendered on the client _after_ the first render
    // so there are no bounces when you go between pages

    // state.saved is requried because the api doesn't always
    // update the state of the post properly. This is because
    // the post doesn't always get cached, and the model update/mergeProps
    // rely on the object that's been updated being in cache.
    // store the saved state ourselves so that saved renders
    // as expected on search pages and other non-listing pages
    this.state = {
      saved: props.post.saved,
      score: this.voteController.score,
      voteDirection: this.voteController.voteDirection,
      dropdownTarget: false,
    };
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

  onSave(saved) {
    this.setState({ saved });
  }

  onScoreChanged(voteController) {
    this.setState({
      score: voteController.score,
      voteDirection: voteController.voteDirection,
    });
  }

  onVote(direction) {
    if (this.props.isArchived) { return; }
    this.voteController.userCastVote(direction);
  }

  renderCommentsLink(post) {
    if (post.disable_comments) {
      return;
    }

    const { num_comments } = post;

    return (
      <a
        className='PostFooter__hit-area PostFooter__comments-link'
        href={ post.cleanPermalink }
      >
        <span className='PostFooter__comments-icon icon-comment' />
        { num_comments }
      </a>
    );
  }

  renderToolsDropdown(dropdownTarget) {
    const {
      post,
      user,
      single,
      app,
      apiOptions,
      viewComments,
      onReport,
      onHide,
      onEdit,
      onDelete,
    } = this.props;

    const { saved } = this.state;

    return (
      <PostDropdownController
        dropdownTarget={ dropdownTarget }
        post={ post }
        user={ user }
        single={ single }
        saved={ saved }
        onCloseDropdown={ this.onDropdownClosed }
        app={ app }
        apiOptions={ apiOptions }
        viewComments={ viewComments }
        onReport={ onReport }
        onHide={ onHide }
        onEdit={ onEdit }
        onDelete={ onDelete }
        onSave={ this.onSave }
      />
    );
  }

  voteClass(voteDirection) {
    if (voteDirection === 1) { return 'upvoted'; }
    if (voteDirection === -1) { return 'downvoted'; }
    return '';
  }

  renderUpvote(voteDirection) {
    const upvoted = voteDirection === 1;
    let wrapperClassName = `${VOTE_WRAPPER_CLS} ${upvoted ? 'upvoted' : ''}`;
    if (this.mounted) { wrapperClassName += ' m-animated'; }

    return (
      <span className={ wrapperClassName }>
        <span className='icon-upvote blue' />
      </span>
    );
  }

  renderDownVote(voteDirection) {
    const downvoted = voteDirection === -1;
    let wrapperClassName = `${VOTE_WRAPPER_CLS} ${downvoted ? 'downvoted' : ''}`;
    if (this.mounted) { wrapperClassName += ' m-animated'; }

    return (
      <span className={ wrapperClassName }>
        <span className='icon-downvote blue' />
      </span>
    );
  }

  renderScoreIfNotHidden(scoreHidden, score, voteClass) {
    return (
      <span className={ `PostFooter__vote-text ${voteClass}` }>
        { scoreText(score, scoreHidden) }
      </span>
    );
  }

  renderScoreAndVotes(scoreHidden, score, voteDirection, isArchived) {
    const voteClass = this.voteClass(voteDirection);

    return (
      <span>
        <div className='PostFooter__hit-area' onClick={ this.onUpVote }>
          { this.renderScoreIfNotHidden(scoreHidden, score, voteClass) }
          { !isArchived ? this.renderUpvote(voteDirection) : null }
        </div>
        <div className='PostFooter__hit-area' onClick={ this.onDownVote }>
          { !isArchived ? this.renderDownVote(voteDirection) : null }
        </div>
      </span>
    );
  }

  render() {
    const {
      post,
      compact,
      isArchived,
    } = this.props;

    const { dropdownTarget, score, voteDirection } = this.state;
    const scoreHidden = post.hide_score || post.score_hidden;

    return (
      <footer className={ `PostFooter ${compact ? 'size-compact' : ''}` }>
        <div className='PostFooter__left-content'>
          { this.renderCommentsLink(post) }
          <div
            className='PostFooter__dropdown-button PostFooter__hit-area icon-seashells'
            onClick={ this.onOpenDropdown }
          />
          { dropdownTarget ? this.renderToolsDropdown(dropdownTarget) : null }
        </div>
        <div className='PostFooter__vote-wrapper'>
          { this.renderScoreAndVotes(scoreHidden, score, voteDirection, isArchived) }
        </div>
      </footer>
    );
  }
}
