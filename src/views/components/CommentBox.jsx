import React from 'react';
const PropTypes = React.PropTypes;

import { models } from 'snoode';
import querystring from 'querystring';
import savedReply from '../../lib/savedReply';

import BaseComponent from './BaseComponent';

class CommentBox extends BaseComponent {
  constructor(props) {
    super(props);

    this.handleInputChange = this.handleInputChange.bind(this);
    this.submit = this.submit.bind(this);
    this.handleError = this.handleError.bind(this);
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

  async submitComment (text) {
    if (!text) {
      return;
    }

    this.setState({error: ''});

    const { apiOptions, app, token, thingId, onSubmit } = this.props;
    const { requireLogin, config, api } = app;

    if (!token) {
      requireLogin(config.loginPath);

      return;
    }

    const comment = new models.Comment({
      thingId: thingId,
      text: text
    });

    const options = {...api.buildOptions(apiOptions), model: comment};

    try {
      const newComment = await api.comments.post(options);

      savedReply.clear();
      this.setState({reply: ''});

      onSubmit(newComment);
      app.emit('comment', newComment);
    } catch (err) {
      this.handleError(err);
    }
  }

  handleError (e) {
    if (e.errors && e.errors.length) {
      const error = e.errors[0][1];
      this.setState({ error });
    } else {
      this.setState({error: 'There was a problem'});

      const { ctx, app } = this.props;
      app.error(e, ctx, app, {redirect: false, replaceBody: false});
    }
  }

  render () {
    const { reply, error } = this.state;
    const { thingId, ctx } = this.props;
    let csrf;

    if(ctx.csrf) {
      csrf = (<input type='hidden' name='_csrf' value={ ctx.csrf } />);
    }

    let errorMessage;
    if (error) {
      errorMessage = (<span className='text-danger pull-left'>{ error }</span>);
    }

    return (
      <div className='row CommentBox'>
        <form action={ '/comment' } method='POST' onSubmit={ this.submit }>
          <input type='hidden' name='thingId' value={ thingId } />
          { csrf }
          <label className='sr-only' htmlFor={ 'textarea-' + thingId }>Comment</label>
          <div className='CommentBox-textarea-holder'>
            <textarea placeholder='Add your comment!' id={ 'textarea-' + thingId } rows='2'
                      className='form-control' name='text' ref='text'
                      onChange={ this.handleInputChange } value={ reply } ></textarea>
          </div>
          { errorMessage }
          <button type='submit' className='btn btn-post' disabled={!reply}>Post</button>
        </form>
      </div>
    );
  }
}

CommentBox.propTypes = {
  apiOptions: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  thingId: PropTypes.string.isRequired,
  token: PropTypes.string,
};

export default CommentBox;
