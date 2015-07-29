import React from 'react';
import globals from '../../globals';
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
    var el = React.findDOMNode(this.refs.text);
    var value = el.value;

    this.setState({
      reply: value,
    });

    savedReply.set(this.props.thingId, value);
  }

  submit (e) {
    e.preventDefault();

    var el = React.findDOMNode(this.refs.text);
    var text = el.value.trim();

    this.submitComment(text);
  }

  submitComment (text) {
    if (!text) {
      return;
    }

    var g = globals();

    if (!this.props.token) {
      g.app.redirect(g.loginPath);

      return;
    }

    var comment = new models.Comment({
      thingId: this.props.thingId,
      text: text
    });

    var options = g.api.buildOptions(this.props.apiOptions);

    options = Object.assign(options, {
      model: comment,
    });

    g.api.comments.post(options).done((function(comment) {
      savedReply.clear();
      this.setState({ reply: '' });
      this.props.onSubmit(comment.data);
    }).bind(this));

    g.app.emit('comment', comment);
  }

  render () {
    var value = this.state.reply;
    var className = value && value.trim() ? 'has-content' : '';
    var csrf;

    if(this.props.csrf) {
      csrf = (<input type='hidden' name='_csrf' value={ this.props.csrf } />);
    }

    return (
      <div className='row CommentBox'>
        <form action={ '/comment' } method='POST' onSubmit={ this.submit.bind(this) }>
          <input type='hidden' name='thingId' value={ this.props.thingId } />
          { csrf }
          <label className='sr-only' htmlFor={ 'textarea-' + this.props.thingId }>Comment</label>
          <div className={`CommentBox-textarea-holder ${className}`}>
            <textarea placeholder='Add your comment!' id={ 'textarea-' + this.props.thingId } rows='2'
                      className='zoom-fix form-control' name='text' ref='text'
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
