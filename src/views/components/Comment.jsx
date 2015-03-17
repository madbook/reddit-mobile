import React from 'react';
import moment from 'moment';

import VoteFactory from '../components/Vote';
var Vote;

import CommentBoxFactory from '../components/CommentBox';
var CommentBox;

import short from '../../lib/formatDifference';

function mobilify(url) {
  return url.replace(/^https?:\/\/(?:www\.)?reddit.com/, '');
}

class Comment extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      comment: this.props.comment,
      collapsed: this.props.comment.hidden,
      showReplyBox: false,
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
    })
  }

  showReplyBox (e) {
    e.preventDefault();

    this.setState({
      showReplyBox: !this.state.showReplyBox,
    });
  }

  onNewComment (comment) {
    this.state.comment.replies = this.state.comment.replies || [];
    this.state.comment.replies.splice(0,0,comment);

    this.replaceState({
      comment: this.state.comment,
      collapsed: false,
      showReplyBox: false,
    });
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

    var distinguished = comment.distinguished ? ' text-distinguished' : '';

    var scoreClass = 'up';

    var commentBox;
    var app = props.app;

    if (this.state.showReplyBox) {
      commentBox = (
        <CommentBox {...props} thingId={ comment.name } onSubmit={ this.onNewComment }  />
      );
    }

    if (comment.score < 0) {
      scoreClass = 'down';
    }

    if (comment.author_flair_text) {
      authorFlair = <span className={ 'label label-default ' + comment.author_flair_cssclass }>
        { comment.author_flair }
      </span>;
    }

    if (op == comment.author) {
      opClass = 'label label-primary label-large';
    }

    var headerCollapseClass = '';
    var contentCollapseClass = '';

    if (this.state.collapsed) {
      headerCollapseClass = 'comment-header comment-collapsed';
      contentCollapseClass = 'comment-content comment-collapsed';
    }

    if (comment.gilded) {
      gilded = (
        <li><span className='glyphicon glyphicon-gilded' /></li>
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

                  return <Comment {...props} comment={c} key={key} nestingLevel={level + 1} op={op}  />;
                }
              })
            }
          </div>
        );
      }

      vote = (
        <Vote {...props} thing={ comment }/>
      );
    } else {
      vote = (
        <span className='label label-primary'>
          <span className='glyphicon glyphicon-arrow-up'></span>
          { comment.score }
        </span>
      );
    }

    return (
      <div className={ 'comment' }>
        <div className={ commentCollapseClass }>
          <article>
            <div className={'comment-submitted ' + headerCollapseClass}>
              <ul className='linkbar linkbar-compact'>
                <li>
                  <a href='#' onClick={ this.collapse.bind(this) }>
                    <span className='glyphicon glyphicon-collapse-down'></span>
                  </a>
                </li>
                <li>
                  <strong className={ opClass }>
                    <a href={ '#/u/' + comment.author } className={ distinguished }>
                      { comment.author }
                    </a>
                  </strong>

                  { authorFlair }
                  { gilded }
                </li>


                <li>
                  <a href={ permalink } className='text-muted'>{ submitted }</a>
                </li>

                <li>
                  { vote }
                </li>
              </ul>
            </div>

            <div className={ contentCollapseClass }>
              <div className='comment-content vertical-spacing-sm' dangerouslySetInnerHTML={{
                __html: comment.bodyHtml
              }} />

              <footer>
                <ul className='linkbar'>
                  <li>
                    <a href={'/comment/' + comment.id } className='btn btn-xs' onClick={ this.showReplyBox.bind(this) } data-no-route='true'>reply</a>
                  </li>
                </ul>

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

  return app.mutate('core/components/comment', Comment);
}

export default CommentFactory;
