import React from 'react';
import { models } from 'snoode';

class CommentBox extends React.Component {
  constructor(props) {
    super(props);
  }

  shouldComponentUpdate () {
    return false;
  }

  submit (e) {
    e.preventDefault();
    var textEl = this.refs.text.getDOMNode();
    var text = textEl.value.trim();

    this.submitComment(this.props.thingId, text);
    textEl.value = '';
  }

  submitComment (thingId, text) {
    if (!this.props.token) {
      window.location = '/login';
      return;
    }

    var comment = new models.Comment({
      thingId: thingId,
      text: text
    });

    var options = this.props.api.buildOptions(this.props.token);

    options = Object.assign(options, {
      model: comment,
    });

    var onSubmit = this.props.onSubmit;

    this.props.api.comments.post(options).done((function(comment) {
      this.props.onSubmit(comment);
    }).bind(this));
  }

  render () {
    var csrf;

    if(this.props.csrf) {
      csrf = (<input type='hidden' name='_csrf' value={ this.props.csrf } />);
    }

    return (
      <div className='row CommentBox'>
        <div className='col-xs-12'>
          <form action={ '/comment' } method='POST' onSubmit={ this.submit }>
            <div className='form-group'>
              <label className='sr-only' htmlFor={ 'textarea-' + this.props.thingId }>Comment</label>
              <textarea placeholder='Add your comment!' id={ 'textarea-' + this.props.thingId } rows='2' className='form-control' name='text'></textarea>
              <input type='hidden' name='thingId' value={ this.props.thingId } />
              { csrf }
            </div>

            <button type='submit' className='btn-post'>Post</button>
          </form>
        </div>
      </div>
    );
  }
}

function CommentBoxFactory(app) {
  return app.mutate('core/components/commentBox', CommentBox);
}

export default CommentBoxFactory;
