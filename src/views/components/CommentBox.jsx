import React from 'react';
import { models } from 'snoode';
import querystring from 'querystring';

import BaseComponent from './BaseComponent';

const { PropTypes } = React;

class CommentBox extends BaseComponent {
  handleInputChange = (e) => {
    let content = this._getTextContent();
    let hasContent = !!content;

    this.setState({hasContent});
  }

  submit = (e) => {
    e.preventDefault();

    let text = this._getTextContent();

    this.submitComment(text);
  }

  constructor(props) {
    super(props);

    this.state = {
      hasContent: false,
    };
  }

  _getTextContent() {
    let el = React.findDOMNode(this.refs.text);

    return el.value.trim();
  }

  submitComment(text) {
    if (!text) {
      return;
    }

    const {
      apiOptions,
      app,
      onSubmit,
      thingId,
      token,
    } = this.props;

    if (!token) {
      app.requireLogin(app.config.loginPath);

      return;
    }

    let comment = new models.Comment({
      text,
      thingId,
    });
    let options = app.api.buildOptions(apiOptions);

    options = Object.assign(options, {
      model: comment,
    });

    app.api.comments.post(options).then((comment) => {
      let el = React.findDOMNode(this.refs.text);

      el.value = '';

      this.setState({
        hasContent: false
      });

      onSubmit(comment);
    });

    app.emit('comment', comment);
  }

  render() {
    const { hasContent } = this.state;
    const { ctx, thingId } = this.props;

    let className = hasContent ? 'has-content' : '';

    return (
      <div className='row CommentBox'>
        <form action='/comment' method='POST' onSubmit={ this.submit }>
          <input type='hidden' name='thingId' value={ thingId } />

          { ctx.csrf ? (
            <input type='hidden' name='_csrf' value={ ctx.csrf } />
          ) : null }

          <label className='sr-only' htmlFor={ `textarea-${thingId}` }>Comment</label>
          <div className={ `CommentBox-textarea-holder ${className}` }>
            <textarea
              id={ `textarea-${thingId}` }
              className='form-control'
              ref='text'
              name='text'
              onChange={ this.handleInputChange }
              placeholder='Add your comment!'
              rows='2'
            ></textarea>
          </div>
          <button type='submit' className='btn-post'>Post</button>
        </form>
      </div>
    );
  }

  static propTypes = {
    apiOptions: PropTypes.object.isRequired,
    app: PropTypes.object.isRequired,
    ctx: PropTypes.object.isRequired,
    onSubmit: PropTypes.func.isRequired,
    thingId: PropTypes.string.isRequired,
    token: PropTypes.string,
  };
}

export default CommentBox;
