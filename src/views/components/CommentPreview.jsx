import React from 'react';
import moment from 'moment';

import short from '../../lib/formatDifference';
import mobilify from '../../lib/mobilify';

class CommentPreview extends React.Component {
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

  render () {
    var comment = this.props.comment;
    var submitted = short(comment.created_utc * 1000);

    return (
      <div className='panel'>
        <div className='panel-body'>
          <div className='row'>
            <div className='col-xs-11'>
              <a href={ mobilify(comment.link_url) }>
                { comment.link_title }
              </a>
              <span className='text-muted'> in </span>
              <a href={ `/r/${comment.subreddit}` }>
                /r/{ comment.subreddit }
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
              __html: comment.bodyHtml
            }} />
          </div>
        </div>
      </div>
    );
  }
}

function CommentPreviewFactory(app) {
  return app.mutate('core/components/commentPreview', CommentPreview);
}

export default CommentPreviewFactory;
