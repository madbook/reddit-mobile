import React from 'react';
import _ from 'lodash';
import globals from '../../globals';
import { models } from 'snoode';
import throttle from 'lodash/function/throttle';

import BasePage from './BasePage';
import CaptchaBox from '../components/CaptchaBox';
import CheckmarkIcon from '../components/icons/CheckmarkIcon';
import Modal from '../components/Modal';
import SeashellsDropdown from '../components/SeashellsDropdown';
import SubredditSelectionButton from '../components/SubredditSelectionButton';

function _removeNewLines(title) {
  return title.replace(/(\r\n|\n|\r)/gm,' ');
}

function _determineKind(body) {
  var words = body.trim(' ').split(' ');
  var hasProtocol = /^(http|https):\/\/[^ "]+$/.test(words[0]);
  if (words.length === 1 && hasProtocol) {
    return 'link';
  } else {
    return 'self';
  }
}

var debouncedDetermineKind = throttle(_determineKind, 1000);


class SubmitPage extends BasePage {
  constructor(props) {
    super(props);

    this.state = {
      subreddit: props.subredditName || 'choose a subreddit',
      subredditSelectionOpen: false,
      title: '',
      body: '',
      kind: props.type || '',
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
    };
  }

  componentDidMount () {
    super.componentDidMount();

    var saved = global.localStorage.getItem('savedLinkContent');
    if (saved) {
      var parsed = JSON.parse(saved);
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
      }
    });

    var sub = this.state.subreddit;
    var titleEl = this.refs.title.getDOMNode();
    var title = titleEl.value.trim();
    var bodyEl = this.refs.body.getDOMNode();
    var body = bodyEl.value.trim();

    var kind = _determineKind(body);

    var errors = this._validateContent(sub, title, body);

    if (errors.length) {
      this.setState({
        error: {
          type: 'Incomplete:',
          message: 'all required fields must be filled out.',
          fields: errors,
        }
      });

      globals().app.emit('post:error');
      return;
    }

    title = _removeNewLines(title);

    this._submitPost(this.props.thingId, body, title, kind);
  }

  _validateContent (sub, title, body) {
    var errors = [];
    if (sub === '' || sub === 'choose a subreddit') {
      errors.push('subreddit');
    }
    if (title === '') {
      errors.push('title');
    }
    return errors;
  }

  _submitPost (thingId, body, title, kind) {
    var props = this.props;
    var newLink = {
      title: title,
      sr: this.state.subreddit,
      kind: kind,
      sendreplies: this.state.sendReplies,
      resubmit: false,
      iden: this.state.captchaIden,
      captcha: this.state.captchaAnswer,
    };


    if (kind === 'link') {
      newLink.text = '';
      newLink.url = body;
    } else {
      newLink.text = body;
      newLink.url = '';
    }

    var link = new models.Link(newLink);
    var options = globals().api.buildOptions(this.props.apiOptions);

    options = Object.assign(options, {
      model: link,
    });

    var deferred = globals().api.links.post(options)

    deferred.then(function(res) {
      if (res.data && res.data.url) {
        var url = res.data.url.replace(/^https?:\/\/(?:www\.)?reddit.com/, '');

        globals().app.redirect(url);
        globals().app.emit('post:submit', link.sr);
      } else {
        this._handleApiErrors(res);
        globals().app.emit('post:error');
      }
    }.bind(this),
    function(err) {
      this._handleApiErrors(err[0])
    }.bind(this));
  }

  _handleApiErrors (err) {
    if (Array.isArray(err)) {
      var type = err[0];
      var message = err[1];

      if (type === 'BAD_CAPTCHA') {
        this.setState({
          captchaIden: '',
          captchaAnswer: '',
          requiresCaptcha: true,
          captchaCount: this.state.captchaCount + 1,
          error: {
            type: type,
            message: message,
          },
        });
      } else {
        this.setState({
          error: {
            type: type,
            message: message,
          }
        });
      }
    }
  }

  changeSubreddit (newSub) {
    globals().app.emit('post:selectSubreddit', newSub);
    this.setState({ subreddit: newSub });
    this.setState({ subredditSelectionOpen: false });
  }

  toggleSubSelect () {
    this.setState({subredditSelectionOpen: !this.state.subredditSelectionOpen});
  }

  handleChange (type, e) {
    var newState = {};
    newState[type] = e.target.value;

    if (type === 'body') {
      newState.kind = debouncedDetermineKind(e.target.value)
    }

    this.setState(newState);
  }

  changeSendReplies (e) {
    this.setState({sendReplies: !this.state.sendReplies});
  }

  close () {
    globals().app.redirect('/');
  }

  updateCaptchaInfo (info) {
    this.setState({
      captchaIden: info.iden,
      captchaAnswer: info.answer,
    });
  }

  goToAboutPage (subName) {
    var props = this.props;

    if (subName) {
      var content = {
        title: this.state.title,
        body: this.state.body,
        sendReplies: this.state.sendReplies,
        subreddit: this.state.subreddit
      };

      global.localStorage.setItem('savedLinkContent', JSON.stringify(content));
      var url = '/r/' + subName + '/about';

      globals().app.redirect(url);
    }
  }

  render () {
    var props = this.props;
    var subredditName = this.state.subreddit;

    var type = this.state.kind || 'link';
    var typeLable = '';
    if (this.state.kind) {
      var typeLable = (this.state.kind === 'self') ? 'text ' : 'link ';
    }

    var classes = {
      body: '',
      title: '',
      subreddit: '',
    };

    var errorClass = 'visually-hidden';
    var errorText = '';
    var error = this.state.error;
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
      errorText = error.type + ' ' + error.message;
      errorClass = 'row alert alert-danger alert-bar Submit-alert-bar';
    }

    var captcha;
    var showCaptchaError = (this.state.captchaCount > 1 &&
                            error.type === 'BAD_CAPTCHA');

    if (this.state.requiresCaptcha) {
      captcha = (
        <Modal open={true} >
          <div className='Submit-captcha-heading' >
            <span>Ok, one more thing. You're human right?</span>
          </div>
          <CaptchaBox
            {...props}
            cb={this.updateCaptchaInfo.bind(this)}
            iden={this.state.captchaIden}
            answer={this.state.captchaAnswer}
            action={this.submit.bind(this)}
            actionName={'Post'}
            error={showCaptchaError}
          />
        </Modal>
      );
    }

    var postForm;
    if (!this.state.subredditSelectionOpen) {
      postForm = (
        <div className='Submit-main-form-wrap'>
          <div className='row Submit-header'>
            <div className='Submit-centered'>
              <button type='button' className='close pull-left' onClick={ this.close.bind(this) }>
                <span className='Submit-close' aria-hidden='true'>&times;</span>
              </button>
              <span className='Submit-header-text'>{'Create a new ' + typeLable + 'post'}</span>
              <button
                className='pull-right btn btn-primary submit-send-btn'
                type='submit'
                onClick={this.submit.bind(this)}
              >Post</button>
            </div>
          </div>
          <div className={ errorClass } role='alert'>
            <div className='Submit-centered'>
              { errorText }
            </div>
          </div>
            <div className={'Submit-title ' + classes.title}>
              <div className='Submit-centered'>
                <textarea className='form-control full-screen-textarea'
                          placeholder='Give this post a title'
                          name='title'
                          ref='title'
                          maxLength='300'
                          onChange={this.handleChange.bind(this, 'title')}
                          value={this.state.title}
                ></textarea>
              </div>
            </div>
            <div className={'Submit-body Submit-centered ' + classes.body}>
              <div className='Submit-body-holder'>
                <textarea className='form-control Submit-body-text zoom-fix'
                          placeholder='share something interesting'
                          ref='body'
                          name={type}
                          onChange={this.handleChange.bind(this, 'body')}
                          value={this.state.body}
                ></textarea>
              </div>
            </div>

          { captcha }

          <div className='Submit-centered'>
            <div className='Submit-sendreplies-box'>
              <SeashellsDropdown right={ true } reversed={ true }>
                <li className='Dropdown-li'>
                  <button type='button' className='Dropdown-button' onClick={ this.changeSendReplies.bind(this) }>
                    <span ><CheckmarkIcon played={this.state.sendReplies} /> send replies to my inbox</span>
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
      <form className='Submit-form' action={ '/submit' } method='POST' >
        { postForm }
          <SubredditSelectionButton
            {...props}
            subreddit={subredditName}
            changeSubreddit={this.changeSubreddit.bind(this)}
            toggleOpen={this.toggleSubSelect.bind(this)}
            open={this.state.subredditSelectionOpen}
            goToAboutPage={this.goToAboutPage.bind(this)}
            errorClass={classes.subreddit}
          />
      </form>
    );
  }
}

//TODO: someone more familiar with this component could eventually fill this out better
SubmitPage.propTypes = {
  // apiOptions: React.PropTypes.object,
  kind: React.PropTypes.string,
  resubmit: React.PropTypes.bool,
  subredditName: React.PropTypes.string,
  thingId: React.PropTypes.string,
  type: React.PropTypes.string,
}

export default SubmitPage;
