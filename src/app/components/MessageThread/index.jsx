import './styles.less';
import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { BackAnchor, JSForm } from 'platform/components';
import * as mailActions from 'app/actions/mail';
import ThreadMessage from './Message';

const T = React.PropTypes;

export class MessageThread extends React.Component {
  static propTypes = {
    headMessage: T.object.isRequired,
    messages: T.object.isRequired,
    replyMessageId: T.string.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      showForm: false,
      formBody: '',
    };
  }

  onFormSubmitAction = data => {
    this.props.onFormSubmit(data);
    this.setState({ showForm: false, formBody: '' });
  };

  onToggleShowForm = () => {
    this.setState({ showForm: !this.state.showForm });
  };

  onEditReply = e => {
    e.preventDefault();
    this.setState({ formBody: e.target.value });
  };

  render() {
    const {
      headMessage,
      messages,
      replyMessageId,
    } = this.props;
    const { showForm } = this.state;

    return (
      <div className='MessageThread'>
        <div className='MessageThread__header'>
          <BackAnchor
            className='MessageThread__backlink icon icon-x'
            href="/message/messages/"
          />
          <div className='MessageThread__subject'>
            { headMessage.subject }
          </div>
        </div>
        <div className='MessageThread__divider' />
        <div className='MessageThread__content'>
          { this.renderMessage(headMessage) }
          { headMessage.replies.map(reply => this.renderMessage(messages[reply])) }
        </div>
        { replyMessageId ? this.renderReplyToggle() : null }
        { (showForm && replyMessageId) ? this.renderForm(replyMessageId) : null }
      </div>
    );
  }

  renderMessage(message) {
    return (
      <div className='MessageThread__item'>
        <ThreadMessage message={ message } />
      </div>
    );
  }

  renderReplyToggle() {
    const { showForm } = this.state;

    if (showForm) {
      return (
        <div className='MessageThread__reply' onClick={ this.onToggleShowForm }>
          <span className='MessageThread__cancelReplyIcon icon icon-x' />
        </div>
      );
    }

    return (
      <div className='MessageThread__reply' onClick={ this.onToggleShowForm }>
        <span className='MessageThread__replyIcon icon icon-reply2' />
        Reply
      </div>
    );
  }

  renderForm(messageId) {
    const { formBody } = this.state;

    return (
      <JSForm
        className='MessageThread__form'
        onSubmit={ this.onFormSubmitAction }
      >
        <textarea
          className='MessageThread__formBody'
          name='body'
          placeholder='Memes go here'
          value={ formBody }
          rows='5'
          onChange={ this.onEditReply }
        />
        <input
          name='thingId'
          type='hidden'
          readOnly
          value={ messageId }
        />
        <button
          className='MessageThread__formSubmit'
          type='submit'
        >
          SEND MESSAGE
        </button>
      </JSForm>
    );
  }
}

const selector = createSelector(
  state => state.messages,
  state => state.user,
  (messages, user) => ({
    messages,
    user,
  })
);

const mapDispatchToProps = dispatch => ({
  onFormSubmit: data => dispatch(mailActions.postMessage(data)),
});

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const threadId = ownProps.urlParams.threadId;
  const { messages, user } = stateProps;

  const headMessageId = `t4_${threadId}`;
  const headMessage = messages[headMessageId];

  // We can only reply to a message thread if the other side has sent
  // us a message. For example, if there's one message in the thread and
  // the current user sent it, they can't send further messages until the
  // other side sends a reply.

  // Get the latest reply from the other side and we reply to that...
  // First, copy and reverse all replies and add the head message id as well.
  const recentMessageIds = [ ...headMessage.replies.slice().reverse(), headMessageId ];

  // Find the most recent reply that's not from the user.
  // If one isn't found, they can't reply, plain and simple.
  const replyMessageId = recentMessageIds.find(id => messages[id].author !== user.name);

  return {
    ...stateProps,
    ...dispatchProps,
    headMessage,
    replyMessageId,
  };
};

export default connect(selector, mapDispatchToProps, mergeProps)(MessageThread);
