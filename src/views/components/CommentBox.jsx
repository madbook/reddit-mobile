import React from 'react';

import { models } from 'snoode';
import querystring from 'querystring';
import savedReply from '../../lib/savedReply';

import BaseComponent from './BaseComponent';

class CommentBox extends BaseComponent {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount () {
    this.setState({
      reply: savedReply.get(this.props.thingId),
    });
  }

  handleInputChange (e) {
    const value = this.refs.text.value;

    this.setState({
      reply: value,
    });

    savedReply.set(this.props.thingId, value);
  }

  submit (e) {
    e.preventDefault();

    const text = this.refs.text.value.trim();

    this.submitComment(text);
  }

  submitComment (text) {
    if (!text) {
      return;
    }

    if (!this.props.token) {
      this.props.app.requireLogin(this.props.app.config.loginPath);

      return;
    }

    var comment = new models.Comment({
      thingId: this.props.thingId,
      text: text
    });

    var options = this.props.app.api.buildOptions(this.props.apiOptions);

    options = Object.assign(options, {
      model: comment,
    });

    this.props.app.api.comments.post(options).then((function(comment) {
      savedReply.clear();
      this.setState({ reply: '' });
      this.props.onSubmit(comment);
    }).bind(this));

    this.props.app.emit('comment', comment);
  }

  render () {
    var value = this.state.reply;
    var className = value && value.trim() ? 'has-content' : '';
    var csrf;

    if(this.props.ctx.csrf) {
      csrf = (<input type='hidden' name='_csrf' value={ this.props.ctx.csrf } />);
    }

    return (
      <div className='row CommentBox'>
        <form action={ '/comment' } method='POST' onSubmit={ this.submit.bind(this) }>
          <input type='hidden' name='thingId' value={ this.props.thingId } />
          { csrf }
          <label className='sr-only' htmlFor={ 'textarea-' + this.props.thingId }>Comment</label>
          <div className={`CommentBox-textarea-holder ${className}`}>
            <textarea placeholder='Add your comment!' id={ 'textarea-' + this.props.thingId } rows='2'
                      className='form-control' name='text' ref='text'
                      onChange={ this.handleInputChange.bind(this) } value={ value } ></textarea>
          </div>
          <button type='submit' className='btn-post'>Post</button>
        </form>
      </div>
    );
  }
}

//TODO: someone more familiar with this component could eventually fill this out better
CommentBox.propTypes = {
  // apiOptions: React.PropTypes.object,
  onSubmit: React.PropTypes.func.isRequired,
  thingId: React.PropTypes.string.isRequired,
  token: React.PropTypes.string,
};

export default CommentBox;
