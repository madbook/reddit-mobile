import React from 'react';
import moment from 'moment';

import VoteFactory from '../components/Vote';
var Vote;

import CommentBoxFactory from '../components/CommentBox';
var CommentBox;

import ListingDropdownFactory from '../components/ListingDropdown';
var ListingDropdown;

import PlayIconFactory from '../components/PlayIcon';

import short from '../../lib/formatDifference';
import mobilify from '../../lib/mobilify';

class Comment extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      comment: this.props.comment,
      collapsed: this.props.comment.hidden,
      showReplyBox: false,
      showTools: false,
      favorited: false,
      optionsOpen: false,
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    return (nextProps !== this.props || nextState !== this.state);
  }

  // The collapsy icon
  collapse (e) {
    e.preventDefault();
    this.setState({
      collapsed: !this.state.collapsed,
      showTools: false,
      showReplyBox: false,
      optionsOpen: false,
    })
  }

  showReplyBox (e) {
    e.preventDefault();

    this.setState({
      showReplyBox: !this.state.showReplyBox,
    });
  }

  favorite (e) {
    e.preventDefault();

    this.setState({
      favorited: !this.state.favorited,
    });
  }

  openOptions (e) {
    e.preventDefault();

    this.setState({
      optionsOpen: !this.state.optionsOpen
    });
  }

  onNewComment (comment) {
    this.state.comment.replies = this.state.comment.replies || [];
    this.state.comment.replies.splice(0, 0, comment);

    this.setState({
      comment: this.state.comment,
      collapsed: false,
      showReplyBox: false,
      showTools: false,
      optionsOpen: false,
    });
  }

  showTools (e) {
    this.setState({ showTools: !this.state.showTools });
  }

  preventPropagation (e) {
    e.stopPropagation();
  }

  render () {
    var props = this.props;
    var comment = this.state.comment;

    var authorFlair;
    var level = props.nestingLevel;
    var submitted = short(comment.created_utc * 1000);
    var op = props.op;

    var edited = props.edited ? '* ' : '';
    var opClass = '';
    var commentCollapseClass = '';
    var gilded;
    var children;
    var vote;

    var permalink = '/comment/' + comment.id + '?context=3';

    var distinguished = comment.distinguished ? ' text-' + comment.distinguished : '';

    var scoreClass = 'up';

    var commentBox;
    var toolbox;
    var highlighted = '';
    var app = props.app;

    if (this.state.showTools) {
      highlighted = 'comment-highlighted';
      if (this.state.showReplyBox) {
        commentBox = (
          <CommentBox {...props} thingId={ comment.name } onSubmit={ this.onNewComment.bind(this) }  />
        );
      }
      var activeShareClass = (this.state.showReplyBox) ? 'share-icon-active' : '';
      var activeFavoriteClass = (this.state.favorited) ? 'favorite-icon-active' : '';
      toolbox = (
        <ul className='linkbar-spread linkbar-spread-5 comment-toolbar clearfix'>
          <li>
            <a href='#' onClick={this.showReplyBox.bind(this)}>
              <i className={`share-icon glyphicon glyphicon-share-alt text-mirror ${activeShareClass} encircle-icon`}></i>
            </a>
          </li>
          <li className='linkbar-spread-li-double comment-vote-container'>
            <Vote
              app={app}
              thing={ this.props.comment }
              token={ this.props.token }
              api={ this.props.api }
              loginPath={ this.props.loginPath }
            />
          </li>
          <li>
            <div className="encircle-icon encircle-options-icon">
              <ListingDropdown
                listing={this.props.comment}
                app={this.props.app} />
              </div>
          </li>
        </ul>
      );
    }

    if (comment.score < 0) {
      scoreClass = 'down';
    }

    if (comment.author_flair_text) {
      authorFlair = <span className={ 'label label-default ' + comment.author_flair_css_class }>
        { comment.author_flair_text }
      </span>;
    }

    if (op == comment.author) {
      opClass = 'comment-op';
    }

    var headerCollapseClass = '';
    var contentCollapseClass = '';

    if (this.state.collapsed) {
      headerCollapseClass = 'comment-header comment-collapsed';
      contentCollapseClass = 'comment-content comment-collapsed';
    }

    if (comment.gilded) {
      gilded = (
        <span className='icon-gold-circled'/>
      );
    }

    if (!this.state.collapsed) {
      if (comment.replies) {
        children = (
          <div className={ contentCollapseClass }>
            {
              comment.replies.map(function(c, i) {
                if (c) {
                  var key = 'page-comment-' + c.name + '-' + i;

                  return <Comment {...props} comment={c} key={key} nestingLevel={level + 1} op={op}/>;
                }
              })
            }
          </div>
        );
      }
    }

    var caretDirection = (this.state.collapsed) ? 'right' : 'bottom';

    return (
      <div className='comment'>
        <div className={ commentCollapseClass }>
          <article className={`comment-article ${highlighted}`}>
            <div className={'comment-submitted ' + headerCollapseClass}>
              <a href='#' onClick={ this.collapse.bind(this) }>
                <ul className='linkbar linkbar-compact comment-title-list'>
                  <li className='comment-title-collapse-container'>
                    <span className={ `comment-title-vote-icon glyphicon glyphicon-triangle-${caretDirection}` }></span>
                  </li>
                  <li className="comment-title-username">
                    <span className={ opClass + " " + distinguished }>
                      { comment.author }
                    </span>

                    { authorFlair }

                    <span className='comment-timestamp'>
                      { submitted }
                    </span>
                    { gilded }
                  </li>
                  <li className='comment-title-score'>
                    { this.props.comment.score }
                  </li>
                </ul>
              </a>
            </div>

            <div className={ `comment-body ${contentCollapseClass}` }>
              <div className='comment-content vertical-spacing-sm' dangerouslySetInnerHTML={{
                  __html: comment.body_html
                }}
                onClick={this.showTools.bind(this)} />

              <footer>
                { toolbox }
                { commentBox }
              </footer>
            </div>
          </article>

          { children }

        </div>
      </div>
    );
  }
}

function CommentFactory(app) {
  Vote = VoteFactory(app);
  CommentBox = CommentBoxFactory(app);
  ListingDropdown = ListingDropdownFactory(app);

  return app.mutate('core/components/comment', Comment);
}

export default CommentFactory;
