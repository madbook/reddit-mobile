/** @jsx React.DOM */

var React = require('react');
var moment = require('moment');
var difference = require('../../client/js/lib/formatDifference').short;
var please = require('pleasejs');
var process = require('reddit-text-js');

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

var Comment = React.createClass({
  render: function() {
    var authorFlair;
    var level = this.props.nestingLevel;
    var submitted = difference(this.props.comment.created_utc * 1000);

    var edited = this.props.edited ? '* ' : '';
    var comment = 'comments';

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

    if (level > 0) {
      offsetClass = ' comment-offset comment-offset-' + level
    }

    return (
      <div className='comment'>
        <article className={ offsetClass } style={{
         borderColor: borderColor
        }}>
          <div className='comment-submitted'>
            <strong>
              <a href={ '/u/' + this.props.comment.author }>{ this.props.comment.author }</a>
            </strong>
            { authorFlair }&nbsp;&middot;&nbsp;

            { submitted } { edited }&middot;&nbsp;

            <a href='#'><span className='glyphicon glyphicon-circle-arrow-up'></span></a>&nbsp;
            { this.props.comment.score }&nbsp;
            <a href='#'><span className='glyphicon glyphicon-circle-arrow-down'></span></a>

            &nbsp;&middot;&nbsp;
            <div className='dropdown dropdown-inline'>
              <a data-toggle='dropdown' href='#'>Actions <span className='caret'></span></a>
              <ul className='dropdown-menu' role='menu'>
                <li><a href='#'>share</a></li>
                <li><a href='#'>save</a></li>
                <li><a href='#'>hide</a></li>
                <li><a href='#'>report</a></li>
              </ul>
            </div>
          </div>

          <div className='comment-content' dangerouslySetInnerHTML={{
            __html: process(this.props.comment.body).html
          }} />
        </article>

        {
          this.props.comment.replies.map(function(comment, i) {
            if (comment) {
              return <Comment comment={comment} index={i} key={'page-comment-' + i + ':' + i} nestingLevel={level + 1} />;
            }
          })
        }
      </div>
    );
  }
});

module.exports = Comment;
