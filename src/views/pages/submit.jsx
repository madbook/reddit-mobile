import React from 'react';
import { models } from '@r/api-client';
import throttle from 'lodash/function/throttle';

import BasePage from './BasePage';
import CaptchaBox from '../components/CaptchaBox';
import Modal from '../components/Modal';
import SeashellsDropdown from '../components/SeashellsDropdown';
import SubredditSelectionButton from '../components/SubredditSelectionButton';

function _removeNewLines(title) {
  return title.replace(/(\r\n|\n|\r)/gm,' ');
}

function _determineKind(body) {
  const words = body.trim(' ').split(' ');
  const hasProtocol = /^(http|https):\/\/[^ "]+$/.test(words[0]);

  if (words.length === 1 && hasProtocol) {
    return 'link';
  }

  return 'self';
}

const debouncedDetermineKind = throttle(_determineKind, 1000);

class SubmitPage extends BasePage {
  static propTypes = {
    // apiOptions: React.PropTypes.object,
    kind: React.PropTypes.string,
    resubmit: React.PropTypes.bool,
    subredditName: React.PropTypes.string,
    thingId: React.PropTypes.string,
    type: React.PropTypes.string,
  };

  constructor(props) {
    super(props);

    Object.assign(this.state, {
      subredditName: props.subredditName || 'choose a subreddit',
      subredditSelectionOpen: false,
      title: props.postTitle || '',
      body: props.body || '',
      kind: props.type || 'self',
      sendReplies: true,
      captchaIden: '',
      captchaAnswer: '',
      requiresCaptcha: false,
      captchaCount: 0,
      error: {
        type: '',
        message: '',
        fields: [],
      },
    });

    this.updateCaptchaInfo = this.updateCaptchaInfo.bind(this);
    this.submit = this.submit.bind(this);
    this.goToAboutPage = this.goToAboutPage.bind(this);
    this.toggleSubSelect = this.toggleSubSelect.bind(this);
    this.changeSubreddit = this.changeSubreddit.bind(this);
    this.changeSendReplies = this.changeSendReplies.bind(this);
    this.handleTitleChange = this.handleChange.bind(this, 'title');
    this.handleBodyChange = this.handleChange.bind(this, 'body');
    this.close = this.close.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  componentDidMount () {
    super.componentDidMount();

    if (!this.props.app.config.localStorageAvailable) {
      return;
    }

    const saved = global.localStorage.getItem('savedLinkContent');

    if (saved) {
      const parsed = JSON.parse(saved);
      this.setState(parsed);
      global.localStorage.clear();
    }
  }

  submit (e) {
    e.preventDefault();
    this.setState({
      error: {
        type: '',
        message: '',
        fields: [],
      },
    });

    let title = this.refs.title.value.trim();
    const sub = this.state.subredditName;
    const body = this.refs.body.value.trim();

    const kind = _determineKind(body);
    const errors = this._validateContent(sub, title);

    if (errors.length) {
      this.setState({
        error: {
          type: 'Incomplete:',
          message: 'all required fields must be filled out.',
          fields: errors,
        },
      });

      this.props.app.emit('post:error');
      return;
    }

    title = _removeNewLines(title);

    this._submitPost(this.props.thingId, body, title, kind);
  }

  _validateContent (sub, title) {
    const errors = [];
    if (sub === '' || sub === 'choose a subreddit') {
      errors.push('subreddit');
    }
    if (title === '') {
      errors.push('title');
    }
    return errors;
  }

  async _submitPost (thingId, body, title, kind) {
    const { app, apiOptions } = this.props;
    const {
      subredditName,
      subredditId,
      sendReplies,
      captchaIden,
      captchaAnswer,
      data,
    } = this.state;

    const newLink = {
      title,
      kind,
      sr: subredditName,
      sendreplies: sendReplies,
      resubmit: false,
      iden: captchaIden,
      captcha: captchaAnswer,
    };


    if (kind === 'link') {
      newLink.text = '';
      newLink.url = body;
    } else {
      newLink.text = body;
      newLink.url = '';
    }

    const link = new models.Link(newLink);

    const options = {
      ...app.api.buildOptions(apiOptions),
      model: link,
    };

    try {
      const res = await app.api.links.post(options);

      if (res && res.url) {
        const url = res.url.replace(/^https?:\/\/(?:www\.)?reddit.com/, '');

        const eventData = {
          ...this.props,
          post: {
            ...link.toJSON(),
            id: res.id,
            name: res.name,
          },
          user: data.user,
          subreddit: subredditId ? { name: subredditId } : data.subreddit,
        };
        app.emit('post:submit', eventData);
        app.redirect(url);
      } else {
        this._handleApiErrors(res);
        app.emit('post:error');
      }
    } catch (err) {
      this._handleApiErrors(err);
    }
  }

  _handleApiErrors (err) {
    if (Array.isArray(err.errors)) {
      const currentError = err.errors[0];
      const [type,message] = currentError;

      if (type === 'BAD_CAPTCHA') {
        this.setState({
          captchaIden: err.captcha,
          captchaAnswer: '',
          requiresCaptcha: true,
          captchaCount: this.state.captchaCount + 1,
          error: {
            type,
            message,
          },
        });
      } else {
        this.setState({
          error: {
            type,
            message,
          },
        });
      }
    }
  }

  changeSubreddit (newSub, subId) {
    this.props.app.emit('post:selectSubreddit', newSub);
    this.setState({
      subredditName: newSub,
      subredditId: subId,
      subredditSelectionOpen: false,
    });
  }

  toggleSubSelect () {
    this.setState({subredditSelectionOpen: !this.state.subredditSelectionOpen});
  }

  handleChange (type, e) {
    const newState = {};
    newState[type] = e.target.value;

    if (type === 'body') {
      newState.kind = debouncedDetermineKind(e.target.value);
    }

    this.setState(newState);
  }

  changeSendReplies () {
    this.setState({sendReplies: !this.state.sendReplies});
  }

  close () {
    const { subredditName, app } = this.props;
    const path = subredditName ? `/r/${subredditName}` : '/';
    app.redirect(path);
  }

  updateCaptchaInfo (info) {
    this.setState({
      captchaIden: info.iden,
      captchaAnswer: info.answer,
    });
  }

  goToAboutPage (subName) {
    const { app } = this.props;

    if (subName) {
      const content = {
        title: this.state.title,
        body: this.state.body,
        sendReplies: this.state.sendReplies,
        subreddit: this.state.subreddit,
      };

      if (this.props.app.localStorageAvailable) {
        global.localStorage.setItem('savedLinkContent', JSON.stringify(content));
      }

      const url = `/r/${subName}/about`;
      app.redirect(url);
    }
  }

  closeModal() {
    this.setState({ requiresCaptcha: false });
  }

  render () {
    const props = this.props;
    const { subredditName, kind } = this.state;

    let typeLabel = '';
    if (this.state.kind) {
      typeLabel = (kind === 'self') ? 'text ' : 'link ';
    }

    const classes = {
      body: '',
      title: '',
      subreddit: '',
    };

    const error = this.state.error;
    let errorClass = 'visually-hidden';
    let errorText = '';

    if (error.type && error.type !== 'BAD_CAPTCHA') {
      switch (this.state.error.type) {
        // for errors on specfic fields
        case 'Incomplete:':
          this.state.error.fields.map((field) => {
            if (field === 'subreddit') {
              classes[field] = 'text-danger';
            } else {
              classes[field] = 'has-error';
            }
          });
          break;
      }
      errorText = `${error.type} ${error.message}`;
      errorClass = 'row alert alert-danger alert-bar Submit-alert-bar';
    }

    let captcha;
    const showCaptchaError = (this.state.captchaCount > 1 &&
                            error.type === 'BAD_CAPTCHA');

    if (this.state.requiresCaptcha) {
      captcha = (
        <Modal open={ true } close={ this.closeModal } >
          <div className='Submit-captcha-heading' >
            <span>Ok, one more thing. You're human right?</span>
          </div>
          <CaptchaBox
            {...props}
            cb={ this.updateCaptchaInfo }
            iden={ this.state.captchaIden }
            answer={ this.state.captchaAnswer }
            action={ this.submit }
            actionName='Post'
            error={ showCaptchaError }
          />
        </Modal>
      );
    }

    const iconClass = this.state.sendReplies ? 'icon-check-shown' : 'icon-check-hidden';

    let postForm;

    if (!this.state.subredditSelectionOpen) {
      postForm = (
        <div className='Submit-main-form-wrap'>
          <div className='row Submit-header'>
            <div className='Submit-centered'>
              <button type='button' className='close pull-left' onClick={ this.close }>
                <span className='Submit-close' aria-hidden='true'>&times;</span>
              </button>
              <span className='Submit-header-text'>{ `Create a new ${typeLabel}post` }</span>
              <button
                className='pull-right btn btn-primary submit-send-btn'
                type='submit'
                onClick={ this.submit }
              >Post</button>
            </div>
          </div>
          <div className={ errorClass } role='alert'>
            <div className='Submit-centered'>
              { errorText }
            </div>
          </div>
            <div className={ `Submit-title ${classes.title}` }>
              <div className='Submit-centered'>
                <textarea
                  className='form-control full-screen-textarea'
                  placeholder='Give this post a title'
                  name='title'
                  ref='title'
                  maxLength='300'
                  onChange={ this.handleTitleChange }
                  value={ this.state.title }
                ></textarea>
              </div>
            </div>
            <div className={ `Submit-body Submit-centered ${classes.body}` }>
              <div className='Submit-body-holder'>
                <textarea
                  className='form-control Submit-body-text zoom-fix'
                  placeholder='share something interesting'
                  ref='body'
                  name={ kind }
                  onChange={ this.handleBodyChange }
                  value={ this.state.body }
                ></textarea>
              </div>
            </div>

          { captcha }

          <div className='Submit-centered'>
            <div className='Submit-sendreplies-box'>
              <SeashellsDropdown right={ true } reversed={ true } app={ props.app }>
                <li className='Dropdown-li'>
                  <button
                    type='button'
                    className='Dropdown-button'
                    onClick={ this.changeSendReplies }
                  >
                    <span >
                      <span className={ `icon-check ${iconClass}` }> </span>
                       send replies to my inbox
                    </span>
                  </button>
                </li>
              </SeashellsDropdown>
            </div>
          </div>

          <input type='hidden' name='kind' value={ props.kind || 'self' } />
          <input type='hidden' name='resubmit' value={ props.resubmit || false } />
        </div>
      );
    }

    return (
      <form className='Submit-form' action='/submit' method='POST' >
        { postForm }
          <SubredditSelectionButton
            {...props}
            subreddit={ subredditName }
            changeSubreddit={ this.changeSubreddit }
            toggleOpen={ this.toggleSubSelect }
            open={ this.state.subredditSelectionOpen }
            goToAboutPage={ this.goToAboutPage }
            errorClass={ classes.subreddit }
          />
      </form>
    );
  }
}

export default SubmitPage;
