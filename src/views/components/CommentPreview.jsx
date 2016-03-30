import React from 'react';
import mobilify from '../../lib/mobilify';
import propTypes from '../../propTypes';
import short from '../../lib/formatDifference';

const subredditRegex = /\/\/www.reddit.com\/r\/([^/]*)/;
const DOT = ' • ';
function CommentPreview(props) {
  const comment = props.comment;
  const submitted = short(comment.created_utc * 1000);

  // such hack wow many fragile code
  let subreddit = comment.subreddit;
  let match;

  if (!subreddit) {
    match = comment.link_url.match(subredditRegex);

    if (match) {
      subreddit = match[1];
    }
  }

  const { link_id, id, link_url, link_title, body_html, score } = comment;
  const context = `/r/${subreddit}/comments/${link_id.substr(3)}/comment/${id}`;

  return (
    <div className='CommentPreview'>
        <div className='CommentPreview__topWrap'>
          <div className='CommentPreview__title'>
            <a href={ mobilify(link_url) }>
              { link_title }
            </a>
            <p>
              <a href={ `/r/${subreddit}` }>
                r/{ subreddit }
              </a>
              { DOT }
              <a href={ context }>Context</a>
            </p>
          </div>

          <div className='CommentPreview__score-date'>
           { score } <span className='CommentPreview__divider' /> { submitted }
          </div>
        </div>

        <div>
          <div dangerouslySetInnerHTML={ {__html: body_html} } />
        </div>
    </div>
  );
}

CommentPreview.propTypes = {
  comment: propTypes.comment.isRequired,
};

export default CommentPreview;
