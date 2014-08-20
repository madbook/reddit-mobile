/** @jsx React.DOM */

var React = require('react');
var moment = require('moment');
var Showdown = require('showdown');
var converter = new Showdown.converter();

var Comment = React.createClass({
  render: function() {
    var authorFlair;
    var level = this.props.nestingLevel % 12;

    var submitted = moment(this.props.comment.created_utc * 1000);
    var edited = this.props.edited ? '*' : '';
    var comment = 'comments';

    if (this.props.comment.author_flair_text) {
      authorFlair = <span className={ 'label label-default ' + this.props.comment.author_flair_cssclass }>
        { this.props.comment.author_flair }
      </span>;
    }

    var columnClass = 'col-sm-12';

    if (level > 0) {
      columnClass += ' comment-offset-' + level;
    }

    return (
      <div className='comment'>
        <div className='row'>
          <article className={columnClass}>
            <header>
              <h1 className='comment-title'>
                <strong>
                  <a href={ '/u/' + this.props.comment.author }>{ this.props.comment.author }</a>
                </strong>
                { authorFlair }
                &nbsp; { submitted.fromNow() } { edited }
              </h1>
            </header>

            <div className='comment-content' dangerouslySetInnerHTML={{
              __html: converter.makeHtml(this.props.comment.body)
            }} />

            <footer className='comment-footer'>
              <p className='comment-tools'>
                share save hide report
              </p>
            </footer>
          </article>
        </div>

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
