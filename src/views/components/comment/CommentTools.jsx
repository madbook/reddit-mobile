import React from 'react';

import CommentDropdownContent from './CommentDropdownContent';
import DropdownController from '../dropdown/DropdownController';
import scoreText from '../../../lib/scoreText';

const T = React.PropTypes;

export default class CommentTools extends React.Component {
  static propTypes = {
    score: T.number.isRequired,
    app: T.object.isRequired,
    commentAuthor: T.string.isRequired,
    username: T.string, // The user's name
    scoreHidden: T.bool,
    voteDirection: T.number,
    saved: T.bool,
    isArchived: T.bool,
    permalinkUrl: T.string,
    onToggleReplyForm: T.func.isRequired,
    onUpvote: T.func.isRequired,
    onDownvote: T.func.isRequired,
    onEditComment: T.func.isRequired,
    onDeleteComment: T.func.isRequired,
    onSaveComment: T.func.isRequired,
    onReportComment: T.func.isRequired,
    onGildComment: T.func, // not required b/c functionality doesn't exist
    onShareComment: T.func, // not required b/c row is a link
    onGotoUserProfile: T.func, // not required b/c/ row is a link
  };

  static defaultProps = {
    voteDirection: 0,
    scoreHidden: false,
    saved: false,
    isArchived: false,
    permalinkUrl: '',
  };

  componentDidMount() {
    this.mounted = true;
  }

  constructor(props) {
    super(props);

    this.state = {
      dropdownTarget: null,
    };

    this.mounted = false; // doesn't use state because we only webkit-animation
    // to do animations on votes _after_ we're on the client

    this.toggleDropdown = this.toggleDropdown.bind(this);
    this.handleEditClicked = this.handleEditClicked.bind(this);
    this.handleDeleteClicked = this.handleDeleteClicked.bind(this);
    this.handleGildClicked = this.handleGildClicked.bind(this);
    this.handleShareClicked = this.handleShareClicked.bind(this);
    this.handleSaveClicked = this.handleSaveClicked.bind(this);
    this.handleProfileClicked = this.handleProfileClicked.bind(this);
    this.handleReportClicked = this.handleReportClicked.bind(this);
  }

  toggleDropdown(e) {
    this.setState({
      dropdownTarget: this.state.dropdownTarget ? null : e.target,
    });
  }

  handleEditClicked() {
    this.setState({dropdownTarget: null});
    this.props.onEditComment();
  }

  handleDeleteClicked() {
    this.setState({dropdownTarget: null});
    this.props.onDeleteComment();
  }

  handleGildClicked() {
    this.setState({dropdownTarget: null});
    this.props.onGildComment();
  }

  handleShareClicked() {
    this.setState({dropdownTarget: null});
    this.props.onShareComment();
  }

  handleSaveClicked() {
    this.setState({dropdownTarget: null});
    this.props.onSaveComment();
  }

  handleProfileClicked() {
    this.setState({dropdownTarget: null});
    this.props.onGotoUserProfile();
  }

  handleReportClicked(reportReason) {
    this.setState({dropdownTarget: null});
    this.props.onReportComment(reportReason);
  }

  render() {
    const { isArchived } = this.props;
    const { dropdownTarget } = this.state;

    return (
      <div className='CommentTools'>
        <div className='CommentTools__left'>
          { !isArchived ? this.renderReply() : null }
          { this.renderSeashells() }
          { dropdownTarget ? this.renderDropdown() : null }
        </div>
        <div className='CommentTools__right'>
          { this.renderScoreAndUpvote() }
          { !isArchived ? this.renderDownvote() : null }
        </div>
      </div>
    );
  }

  renderReply() {
    return (
      <div
        className='CommentTools__reply icon-reply2'
        onClick={ this.props.onToggleReplyForm }
      />
    );
  }

  renderSeashells() {
    return (
      <div
        className='CommentTools__more icon-seashells'
        onClick={ this.toggleDropdown }
      />
    );
  }

  renderDivider() {
    return <div className='CommentTools__divider' />;
  }

  renderScoreAndUpvote() {
    const { isArchived, score, scoreHidden, voteDirection, onUpvote } = this.props;

    let textColorCls = '';
    if (voteDirection === 1) {
      textColorCls = 'upvoted';
    } else if (voteDirection === -1) {
      textColorCls = 'downvoted';
    }

    return (
      <div className={ `CommentTools__hit-area ${textColorCls}` } onClick={ onUpvote }>
        <div className={ `CommentTools__score ${textColorCls}` }>
          { scoreText(score, scoreHidden) }
        </div>
        { !isArchived ? this.renderUpvote() : null }
      </div>
    );
  }

  renderUpvote() {
    const { voteDirection } = this.props;

    let cls = 'CommentTools__upvote icon-upvote';
    if (this.mounted && voteDirection === 1) { cls += ' m-animated'; }

    return <div className={ cls } />;
  }

  renderDownvote() {
    const { onDownvote, voteDirection } = this.props;

    let cls = 'CommentTools__downvote icon-downvote';
    const voteCls = voteDirection === -1 ? 'downvoted' : '';
    if (this.mounted && voteDirection === -1) { cls += ' m-animated'; }

    return (
      <div className={ `CommentTools__hit-area ${voteCls}` } onClick={ onDownvote } >
        <div className={ cls } />
      </div>
    );
  }

  renderDropdown() {
    const { commentAuthor, username, app, saved, permalinkUrl } = this.props;
    const { dropdownTarget } = this.state;

    return (
      <DropdownController
        target={ dropdownTarget }
        onClose={ this.toggleDropdown }
        app={ app }
        offset={ 8 }
      >
        <CommentDropdownContent
          username={ commentAuthor }
          userOwned={ username === commentAuthor }
          userLoggedIn={ !!username }
          saved={ saved }
          permalinkUrl={ permalinkUrl }
          onEditClicked={ this.handleEditClicked }
          onDeleteClicked={ this.handleDeleteClicked }
          onGoldClicked={ this.handleGildClicked }
          onShareClicked={ this.handleShareClicked }
          onSaveClicked={ this.handleSaveClicked }
          onProfileClicked={ this.handleProfileClicked }
          onReportClicked={ this.handleReportClicked }
        />
      </DropdownController>
    );
  }
}
