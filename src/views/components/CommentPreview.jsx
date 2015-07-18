import React from 'react';
import mobilify from '../../lib/mobilify';
import moment from 'moment';
import propTypes from '../../propTypes';
import short from '../../lib/formatDifference';

import BaseComponent from './BaseComponent';

const subredditRegex = /\/\/www.reddit.com\/r\/([^/]*)/;

class CommentPreview extends BaseComponent {
  constructor(props) {
    super(props);

    this.state = {
      comment: this.props.comment,
      collapsed: this.props.comment.hidden,
      showReplyBox: false,
    }
  }

  render () {
    var comment = this.props.comment;
    var submitted = short(comment.created_utc * 1000);

    // such hack wow many fragile code
    var match = comment.link_url.match(subredditRegex);
    var subreddit;

    if (match) {
      subreddit = match[1];
    }

    return (
      <div className='panel'>
        <div className='panel-body'>
          <div className='row'>
            <div className='col-xs-11'>
              <a href={ mobilify(comment.link_url) }>
                { comment.link_title }
              </a>
              <span className='text-muted'> in </span>
              <a href={ `/r/${subreddit}` }>
                r/{ subreddit }
              </a>
            </div>

            <div className='col-xs-1 text-muted text-right'>
              { comment.score }
              <br />
              { submitted }
            </div>
          </div>
          <div className='row'>
            <div className='col-xs-12' dangerouslySetInnerHTML={{
              __html: comment.body_html
            }} />
          </div>
        </div>
      </div>
    );
  }
}

CommentPreview.propTypes = {
  comment: propTypes.comment.isRequired,
};

export default CommentPreview;
