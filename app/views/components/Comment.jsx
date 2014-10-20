/** @jsx React.DOM */

import * as React from 'react';
import * as moment from 'moment';
import * as please from 'pleasejs';
import * as process from 'reddit-text-js';

import Vote from '../components/Vote';

import { short as difference } from '../../client/js/lib/formatDifference';

var orangereds = please.make_scheme({ h: 16, s: .5, v: 1 }, {
  scheme_type: 'mono'
});

var blues = please.make_scheme({ h: 247, s: .5, v: .9 }, {
  scheme_type: 'mono'
});

function getColorForScore(score, level) {
  var colors = (score > 0) ? orangereds : blues;
  var color = colors[level % colors.length];

  return color;
}

function mobilify(url) {
  return url.replace(/^https?:\/\/(?:www\.)?reddit.com/, '');
}

var Comment = React.createClass({
  render: function() {
    var authorFlair;
    var level = this.props.nestingLevel;
    var submitted = difference(this.props.comment.created_utc * 1000);
    var op = this.props.op;

    var edited = this.props.edited ? '* ' : '';
    var comment = 'comments';
    var opClass = '';
    var commentCollapseClass = '';
    var moreCommentsLink;
    var gilded;

    var permalink = '/comment/' + this.props.comment.id + '?context=3';

    var distinguished = this.props.comment.distinguished ? ' text-distinguished' : '';

    borderColor = getColorForScore(this.props.comment.score, level);

    var scoreClass = 'up';

    if (this.props.comment.score < 0) {
      scoreClass = 'down';
    }

    if (this.props.comment.author_flair_text) {
      authorFlair = <span className={ 'label label-default ' + this.props.comment.author_flair_cssclass }>
        { this.props.comment.author_flair }
      </span>;
    }

    var offsetClass = '';

    if (op == this.props.comment.author) {
      opClass = 'label label-primary label-large';
    }

    if (level > 0) {
      offsetClass = ' comment-offset comment-offset-' + level
    }

    if (this.props.comment.hidden) {
      commentCollapseClass = 'hidden';
    }

    if(this.props.comment.firstHidden) {
      moreCommentsLink = (
        <a href='#' data-action='moreComments' className={ 'small ' + offsetClass } style={{
          borderColor: borderColor
        }}>
          <span className='glyphicon glyphicon-plus'></span>&nbsp;
          view more comments
        </a>
      );
    }

    if (this.props.comment.gilded) {
      gilded = (
        <li><span className='glyphicon glyphicon-gilded' /></li>
      );
    }

    return (
      <div className='comment'>
        { moreCommentsLink }

        <article className={ commentCollapseClass + offsetClass } style={{
          borderColor: borderColor
        }}>
          <div className='comment-submitted'>
            <ul className='linkbar'>
              <li>
                <strong className={ opClass }>
                  <a href={ '/u/' + this.props.comment.author } className={ distinguished }>
                    { this.props.comment.author }
                  </a>
                </strong>

                { authorFlair }
                { gilded }
              </li>


              <li>
                <a href={ permalink } className='text-muted'>{ submitted }</a>
              </li>

              <li>
                <Vote thing={ this.props.comment } />
              </li>
            </ul>
          </div>

          <div className='comment-content vertical-spacing-sm' dangerouslySetInnerHTML={{
            __html: process(this.props.comment.body)
          }} />

          <footer>
            <ul className='linkbar'>
              <li>
                <a href={ permalink }>Reply</a>
              </li>
              <li>
                <div className='dropdown dropdown-inline'>
                  <a data-toggle='dropdown' href='#'>Actions <span className='caret'></span></a>
                  <ul className='dropdown-menu' role='menu'>
                    <li>
                      <a href='#' role='menuitem' tabIndex='-1'>
                        <span className='glyphicon glyphicon-gilded' />
                        gild
                      </a>
                    </li>
                    <li><a href='#' role='menuitem' tabIndex='-1'>share</a></li>
                    <li><a href='#' role='menuitem' tabIndex='-1'>save</a></li>
                    <li><a href='#' role='menuitem' tabIndex='-1'>hide</a></li>
                    <li><a href='#' role='menuitem' tabIndex='-1'>report</a></li>
                  </ul>
                </div>
              </li>
            </ul>
          </footer>
        </article>

        {
          this.props.comment.replies.map(function(comment, i) {
            if (comment) {
              return <Comment comment={comment} index={i} key={'page-comment-' + i + ':' + i} nestingLevel={level + 1} op={op}  />;
            }
          })
        }
      </div>
    );
  }
});

export default Comment;
