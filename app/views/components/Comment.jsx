/** @jsx React.DOM */

var React = require('react');
var moment = require('moment');
var difference = require('../../client/js/lib/formatDifference').short;
var please = require('pleasejs');
var process = require('reddit-text-js');
var Vote = require('../components/Vote');

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
    var op = this.props.op;

    var edited = this.props.edited ? '* ' : '';
    var comment = 'comments';
    var opClass = '';

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
      opClass = 'label label-primary';
    }

    if (level > 0) {
      offsetClass = ' comment-offset comment-offset-' + level
    }

    return (
      <div className='comment'>
        <article className={ offsetClass } style={{
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
              </li>


              <li>
                { submitted }{ edited }
              </li>

              <li>
                <Vote thing={ this.props.comment } />
              </li>

              <li>
                <div className='dropdown dropdown-inline'>
                  <a data-toggle='dropdown' href='#'>Actions <span className='caret'></span></a>
                  <ul className='dropdown-menu' role='menu'>
                    <li>
                      <a href='#' role='menuitem' tabIndex='-1'>
                        <span className='glyphicons glyphicons-gilded' />
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
          </div>

          <div className='comment-content' dangerouslySetInnerHTML={{
            __html: process(this.props.comment.body)
          }} />
        </article>

        {
          this.props.comment.replies.map(function(comment, i) {
            if (comment) {
              return <Comment comment={comment} index={i} key={'page-comment-' + i + ':' + i} nestingLevel={level + 1} op={op} />;
            }
          })
        }
      </div>
    );
  }
});

module.exports = Comment;
