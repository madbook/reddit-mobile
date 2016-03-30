import React from 'react';
import { models } from 'snoode';
import moment from 'moment';
import process from 'reddit-text-js';

import BaseComponent from './BaseComponent';
import Inbox from '../components/Inbox';

const subredditRegex = /\/r\/([^/]*)/;

class MessagePreview extends BaseComponent {
  static propTypes = {
    onSubmit: React.PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      showReply: false,
    };

    this._onReplyClick = this._onReplyClick.bind(this);
    this._onReplySubmit = this._onReplySubmit.bind(this);
  }

  shouldComponentUpdate (nextProps, nextState) {
    return (nextProps !== this.props || nextState !== this.state);
  }

  _onReplyClick (e) {
    e.preventDefault();
    const showReply = this.state.showReply;

    this.setState({
      showReply: !showReply,
    });
  }

  _onReplySubmit (e) {
    e.preventDefault();

    const text = this.refs.replyText.value.trim();

    if (!text) {
      return;
    }

    const message = new models.Message({
      text,
      thingId: this.props.message.parent_id || this.props.message.name,
    });

    let options = this.props.app.api.buildOptions(this.props.apiOptions);

    options = Object.assign(options, {
      model: message,
    });

    this.setState({
      sending: true,
    });

    this.props.app.api.messages.post(options).then((function(data) {
      if (this.props.onSubmit) {
        this.props.onSubmit(data);
      }

      this.setState({
        sending: false,
        showReply: false,
      });
    }).bind(this));

    this.props.app.emit('message:reply', message);
  }

  render () {
    const message = this.props.message;
    const props = this.props;

    const submitted = moment(message.created_utc * 1000);
    let formattedSubmitted;

    if (submitted.diff(moment(), 'days')) {
      formattedSubmitted = submitted.format('l');
    } else {
      formattedSubmitted = submitted.format('LT');
    }

    const readClass = message.new ? ' message-unread' : '';
    const isMine = message.author === props.user.name;

    let context;
    let subreddit;
    let reply;

    const link = message.context || `/message/messages/${message.name}`;

    let type = 'Direct message';

    if (message.parent_id) {
      if (message.parent_id.indexOf('t1') === 0) {
        type = 'Post reply';
      } else if (message.parent_id.indexOf('t3') === 0) {
        type = 'Comment reply';
      }
    }

    if (message.link_title) {
      if (message.subreddit) {
        subreddit = message.subreddit;
      } else if (message.context) {
        subreddit = message.context.match(subredditRegex)[1];
      }

      context = (
        <h3 className='message-title'>
          <a href={ link }>
            { `In ${subreddit} post: "${message.link_title}"` }
          </a>
        </h3>
      );
    } else if (message.subreddit) {
      context = (
        <h3 className='message-title'>
          <a href={ `/r/${ message.subreddit }` }>
            { `r/${message.subreddit}` }
          </a>
        </h3>
      );
    } else if (message.subject) {
      context = (
        <h3 className='message-title'>
          { message.subject }
        </h3>
      );
    }

    let submitClass = '';
    let submitDisabled = false;

    if (this.state.sending) {
      submitClass = 'disabled';
      submitDisabled = true;
    }

    if (this.state.showReply) {
      reply = (
        <form action='/mesage' method='POST' onSubmit={ this._onReplySubmit }>
          <div className='message-preivew-texarea-holder'>
            <textarea
              ref='replyText'
              name='reply'
              placeholder='Message...'
              className={ `form-control ${submitClass}` }
            />
          </div>
          <button
            type='submit'
            className={ `btn btn-primary btn-post btn-block ${submitClass}` }
            disabled={ submitDisabled }
          >Send</button>
          <p>
            <a href='#' className='btn btn-link' onClick={ this._onReplyClick }>Cancel</a>
          </p>
        </form>
      );
    } else {
      if (!message.context && !message.replies.length && props.lastReply) {
        reply = (
          <a
            href={ link }
            className='btn btn-xs btn-primary'
            onClick={ this._onReplyClick }
            data-no-route='true'
          >Reply</a>
        );
      }
    }

    let author;

    if (isMine) {
      author = (
        <h4 className='message-author message-mine'>
          <a href={ link }>
            { `Sent to ${message.dest}` }
          </a>
        </h4>
      );
    } else {
      const distinguished = message.distinguished ? ` text-${message.distinguished}` : '';

      author = (
        <h4 className='message-author'>
          <a href={ link }>
            { `${type} from ` }
            <span className={ distinguished }>{ `${message.author}` }</span>
          </a>
        </h4>
      );
    }

    let replies;

    if (message.replies && message.replies.length > 0) {
      replies = (
        <div className='col-xs-11 col-xs-offset-1'>
          <Inbox
            app={ this.props.app }
            isReply={ true }
            messages={ message.replies }
            user={ this.props.user }
            token={ this.props.token }
            apiOptions={ this.props.apiOptions }
          />
        </div>
      );
    }

    return (
      <article className={ `panel message-preview${readClass}` }>
        <div className='panel-body'>
          <div className='row'>
            <div className='col-xs-12'>
              { context }

              <time dateTime={ submitted.format() } className='text-muted pull-right text-right'>
                { formattedSubmitted }
              </time>

              { author }
            </div>
          </div>

          <div className='row'>
            <div className='col-xs-12'>
              <div
                className='message-body vertical-spacing-top'
                dangerouslySetInnerHTML={ {__html: process(message.body)} }
              />
            </div>

            { replies }

            <div className='col-xs-12'>
              { reply }
            </div>
          </div>
        </div>
      </article>
    );
  }
}

export default MessagePreview;
