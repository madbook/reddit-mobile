import React from 'react/addons';
import constants from '../../constants';
import mobilify from '../../lib/mobilify';
import { models } from 'snoode';
import moment from 'moment';
import propTypes from '../../propTypes';
import short from '../../lib/formatDifference';
import savedReply from '../../lib/savedReply';

import BaseComponent from './BaseComponent';
import CommentBox from '../components/CommentBox';
import ListingDropdown from '../components/ListingDropdown';
import ReportPlaceholder from '../components/ReportPlaceholder';
import Vote from '../components/Vote';

var replyIcon = (
  <span className='icon-reply-circled'>{' '}</span>
);

class Comment extends BaseComponent {
  constructor(props) {
    super(props);

    this.state = {
      comment: props.comment,
      collapsed: props.comment.hidden,
      showReplyBox: false,
      showTools: false,
      reported: false,
      score: props.comment.score,
      editing: false,
    }

    this.setScore = this.setScore.bind(this);
    this.onReport = this.onReport.bind(this);
    this.showReplyBox = this.showReplyBox.bind(this);
    this.toggleEdit = this.toggleEdit.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.showTools = this.showTools.bind(this);
    this.updateComment = this.updateComment.bind(this);
    this.onNewComment = this.onNewComment.bind(this);
    this.toggleCollapsed = this.toggleCollapsed.bind(this);
  }

  componentDidMount () {
    var hasSavedReply = !!savedReply.get(this.props.comment.name);

    if (hasSavedReply) {
      this.setState({
        showReplyBox: hasSavedReply,
        showTools: hasSavedReply,
      });

      React.findDOMNode(this).scrollIntoView();
    }
  }

  setScore (score) {
    this.setState({
      score: score,
    });
  }

  onReport () {
    this.setState({ reported: true });
  }

  // The collapsy icon
  toggleCollapsed (e) {
    e.preventDefault();
    this.setState({
      collapsed: !this.state.collapsed,
      showTools: false,
      showReplyBox: false,
    })
  }

  showReplyBox (e) {
    e.preventDefault();

    this.setState({
      showReplyBox: !this.state.showReplyBox,
    });
  }

  onNewComment (newComment) {
    var comment = Object.assign({}, this.state.comment);
    comment.replies = comment.replies || [];
    comment.replies.unshift(newComment);

    this.setState({
      comment: comment,
      collapsed: false,
      showReplyBox: false,
      showTools: false,
    });
  }

  showTools (e) {
    this.setState({ showTools: !this.state.showTools });
  }

  toggleEdit () {
    this.setState({
      editing: !this.state.editing,
    })
  }

  onDelete () {
    const {app, apiOptions} = this.props;
    let id = this.state.comment.name;
    var options = app.api.buildOptions(apiOptions);

    options = Object.assign(options, {
      id: id,
    });

    // nothing returned for this endpoint
    // so we assume success :/
    app.api.comments.delete(options).then(() => {
      var deletedComment = Object.assign({}, this.state.comment);
      deletedComment.body_html = '<p>[deleted]</p>';
      deletedComment.author = '[deleted]';
      this.setState({
        comment: deletedComment,
        showTools: false,
      })
    })
  }

  updateComment () {
    var {app, apiOptions} = this.props;
    var newText = this.refs.updatedText.getDOMNode().value;
    var oldComment = this.state.comment;
    if (oldComment.body === newText) {
      return;
    }

    var comment = new models.Comment(oldComment);
    var options = app.api.buildOptions(apiOptions);

    options = Object.assign(options, {
      model: comment,
      changeSet: newText,
    });
    // update comment here
    app.api.comments.patch(options).then((data) => {
      if (data) {
        this.setState({
          comment: data,
          editing: false,
        })
        app.emit('comment:edit');
      } else {
        throw [['Sorry', 'There was a problem']];
      }
    }).catch((err) => {
      this.setState({
        editError: err,
      })
    })

  }

  render () {
    let {app, apiOptions, token, nestingLevel, permalinkBase, user, op,
         highlight, subredditName} = this.props;
         
    let {comment, showReplyBox, editing, editError, showTools, collapsed,
         score, reported} = this.state;

    if (reported) {
      return (<ReportPlaceholder />);
    }

    let opClass = (op === comment.author) ? 'comment-op' : '';
    let distinguishedClass = comment.distinguished ? ' text-' + comment.distinguished : '';

    let submitted = short(comment.created_utc * 1000);
    let permalink = permalinkBase + comment.id;

    let showEditAndDel = false;
    if (user && user.name === comment.author) {
      showEditAndDel = true;
    }

    let commentBox;
    let toolbox;
    let highlighted = '';
    if (showTools || highlight === comment.id) {
      highlighted = 'comment-highlighted';

      if (showReplyBox) {
        commentBox = (
          <CommentBox
            {...this.props}
            ref='commentBox'
            thingId={ comment.name }
            onSubmit={ this.onNewComment }
          />
        );
      }
      toolbox = (
        <ul className='linkbar-spread linkbar-spread-5 comment-toolbar clearfix'>
          <li>
            <a className='MobileButton comment-svg' onClick={this.showReplyBox} href='#' >{ replyIcon }</a>
          </li>
          <li className='linkbar-spread-li-double comment-vote-container comment-svg'>
            <Vote
              app={ app }
              setScore={ this.setScore }
              thing={ comment }
              token={ token }
              apiOptions={ apiOptions }
            />
          </li>
          <li>
            <div className="encircle-icon encircle-options-icon">
              <ListingDropdown
                app={ app }
                viewComments={ false }
                saved={ comment.saved }
                subreddit={ subredditName }
                permalink={ permalink }
                onReport={ this.onReport }
                token={ token }
                apiOptions={ apiOptions }
                listing={comment}
                showEditAndDel={ showEditAndDel }
                onEdit={ this.toggleEdit }
                onDelete={ this.onDelete }
                />
            </div>
          </li>
        </ul>
      );
    }

    let authorFlair;
    if (comment.author_flair_text) {
      let authorFlair = (
        <span className={`label label-default ${comment.author_flair_css_class}`}>
          { comment.author_flair_text }
        </span>
      );
    } 

    let gilded;
    if (comment.gilded) {
      let gilded = (
        <span className='icon-gold-circled'/>
      );
    }  

    if (comment.replies && !collapsed) {
      var children = (
        <div className='comment-children comment-content'>
          {
            comment.replies.map((c, i) => {
              if (c) {
                var key = 'page-comment-' + c.name + '-' + i;

                return (
                  <Comment
                    {...this.props}
                    comment={c}
                    key={key}
                    nestingLevel={nestingLevel + 1}
                    op={op}
                  />
                );
              }
            })
          }
        </div>
      );
    }

    if (!collapsed) {
      var body = (
        <div className='comment-body'>
          <div className='comment-content vertical-spacing-sm' dangerouslySetInnerHTML={{
              __html: mobilify(comment.body_html)
            }}
            onClick={this.showTools} />

          <footer className='comment-footer'>
            { toolbox }
            { commentBox }
          </footer>
        </div>
      );
    }

    if (editing) {
      var errorClass = 'visually-hidden';
      var errorText = '';

      if (editError) {
        var err = editError[0];
        errorClass = 'alert alert-danger alert-bar';
        errorText = err[0] + ': ' + err[1];
      }

      body = (
        <div className='comment-edit-box'>
          <div className={ errorClass } role='alert'>
            { errorText }
          </div>
          <div className='comment-textarea-holder'>
            <textarea ref='updatedText' className='form-control' defaultValue={ comment.body }></textarea>
          </div>
          <div className='btn-group btn-group-justified'>
            <div className='btn-group'>
              <button className='btn btn-primary btn-block' type='button' onClick={ this.toggleEdit }>Cancel</button>
            </div>
            <div className='btn-group'>
              <button className='btn btn-primary btn-block' type='button' onClick={ this.updateComment }>Save</button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className='comment'>
        <article className={`comment-article ${highlighted}`}>
          <div className={`comment-submitted ${(collapsed ? 'comment-header comment-collapsed' : '')}`}>
            <a href='#' onClick={ this.toggleCollapsed }>
              <ul className='linkbar linkbar-compact tween comment-title-list'>
                <li className={`comment-title-collapse-container twirly before ${(collapsed ? '' : 'opened')}`}>
                </li>
                <li className="comment-title-username">
                  <span className={`opClass ${distinguishedClass}`}>
                    { comment.author }
                  </span>

                  { authorFlair }

                  { gilded }
                </li>
                <li className='comment-timestamp-score'>
                  <span className='comment-timestamp'>{ submitted }</span>
                  <span className='comment-title-score'>
                    { comment.score_hidden ? '[score hidden]' : score }
                  </span>
                </li>
              </ul>
            </a>
          </div>
          { body }
        </article>
        { children }
      </div>
    );
  }
}

Comment.propTypes = {
  apiOptions: React.PropTypes.object.isRequired,
  comment: propTypes.comment.isRequired,
  highlight: React.PropTypes.string,
  nestingLevel: React.PropTypes.number.isRequired,
  op: React.PropTypes.string.isRequired,
  permalinkBase: React.PropTypes.string.isRequired,
  subredditName: React.PropTypes.string.isRequired,
};

export default Comment;
