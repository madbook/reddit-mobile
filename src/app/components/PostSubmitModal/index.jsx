import React from 'react';
import every from 'lodash/every';
import isEmpty from 'lodash/isEmpty';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { Anchor, JSForm } from '@r/platform/components';

import cx from 'lib/classNames';
import Modal from '../Modal';
import CaptchaBox from '../CaptchaBox';
import * as postingActions from 'app/actions/posting';
import './styles.less';

const T = React.PropTypes;

const MODAL_TITLE_TEXT = { self: 'Text', link: 'Link' };
const SELECT_COMMUNITY = 'Select a community';
const TITLE_PLACEHOLDER = 'Add an interesting title';
const CAPTCHA_URL_BASE = 'https://www.reddit.com/captcha/';

class PostSubmitModal extends React.Component {
  static propTypes = {
    readyToPost: T.bool.isRequired,
    subreddit: T.object.isRequired,
    title: T.string.isRequired,
    meta: T.oneOfType([T.string, T.instanceOf(global.File)]).isRequired,
    showCaptcha: T.bool.isRequired,
    submissionType: T.string.isRequired,
    onFieldUpdate: T.func.isRequired,
    onSubmit: T.func.isRequired,
    onCloseCaptcha: T.func.isRequired,
    onGetNewCaptcha: T.func.isRequired,
  };

  render() {
    const {
      submissionType,
      readyToPost,
      onSubmit,
      onFieldUpdate,
      captchaText,
      captchaImgUrl,
      showCaptcha,
      onCloseCaptcha,
      onGetNewCaptcha,
      title: postTitle,
    } = this.props;

    const modalTitle = MODAL_TITLE_TEXT[submissionType];
    const buttonClass = cx('PostSubmitModal__submit-button', { ready: readyToPost });

    return (
      <Modal exitTo='/' titleText={ modalTitle }>
        <JSForm onSubmit={ onSubmit } className='PostSubmitModal'>

          <div className='PostSubmitModal__submit'>
            <button type='submit' className={ buttonClass }>POST</button>
          </div>

          { this.renderSubredditButton() }

          <div className='PostSubmitModal__title'>
            <input
              value={ postTitle }
              placeholder={ TITLE_PLACEHOLDER }
              onChange={ onFieldUpdate.bind(this, 'title') }
            />
          </div>

          <div className='PostSubmitModal__content'>
            { this.chooseContentInput(submissionType) }
          </div>
        </JSForm>

        { showCaptcha ?
          <CaptchaBox
            captchaText={ captchaText }
            captchaImgUrl={ captchaImgUrl }
            onCloseCaptcha={ onCloseCaptcha }
            onFieldUpdate={ onFieldUpdate }
            onGetNewCaptcha={ onGetNewCaptcha }
            onSubmit={ onSubmit }
          /> :
          null }
      </Modal>
    );
  }

  chooseContentInput() {
    switch (this.props.submissionType) {
      case 'self':
        return this.renderTextInput();
      case 'link':
        return this.renderLinkInput();
      default:
        return this.renderTextInput();
    }
  }

  renderTextInput() {
    return (
      <div className='PostSubmitModal__content-text'>
        <textarea
          rows='5'
          value={ this.props.meta }
          placeholder='Add your text...'
          onChange={ this.props.onFieldUpdate.bind(this, 'meta') }
        />
      </div>
    );
  }

  renderLinkInput() {
    return (
      <div className='PostSubmitModal__content-link'>
        <input
          value={ this.props.meta }
          placeholder='Paste your link here...'
          onChange={ this.props.onFieldUpdate.bind(this, 'meta') }
        />
      </div>
    );
  }

  renderSubredditButton() {
    const { subreddit: { name, iconUrl }, submissionType } = this.props;

    const style = iconUrl ? { backgroundImage: `url(${iconUrl})` } : null;
    const text = name ? name : SELECT_COMMUNITY;
    const commClasses = cx('PostSubmitModal__community-text', { 'greyed': !name });

    return (
      <div className='PostSubmitModal__community'>
        <div className='PostSubmitModal__community-snoo-icon'>
          <div className='PostSubmitModal__community-snoo' style={ style }></div>
        </div>
        <Anchor href={ `/submit/to_community?type=${submissionType}` }>
          <div className={ commClasses }>
            { text }
            <div className='icon icon-nav-arrowdown'></div>
          </div>
        </Anchor>
      </div>
    );
  }
}


const mapStateToProps = createSelector(
  state => state.posting,
  state => state.subreddits,
  state => state.platform.currentPage.urlParams.subredditName,
  (posting, subreddits, subredditName) => {
    const { title, meta, captchaText, captchaIden, currentType: submissionType } = posting;

    const subredditMetaData = subreddits[subredditName];
    const iconUrl = subredditMetaData ? subredditMetaData.iconImage : null;
    const captchaImgUrl = CAPTCHA_URL_BASE + captchaIden;

    const readyFields = submissionType === 'self'
      ? [title, subredditName]
      : [title, meta, subredditName];

    const readyToPost = every(readyFields, v => !isEmpty(v));

    return {
      title,
      meta,
      captchaText,
      captchaIden,
      submissionType,
      readyToPost,
      captchaImgUrl,
      showCaptcha: !!captchaIden,
      subreddit: { name: subredditName, iconUrl },
    };
  }
);

const dispatcher = dispatch => {
  return {
    onFieldUpdate: (name, e) => dispatch(postingActions.updateField(name, e.target.value)),
    onCloseCaptcha: () => dispatch(postingActions.closeCaptcha()),
    onGetNewCaptcha: () => {},    // TODO
    _onSubmit: data => dispatch(postingActions.submitPost(data)),
  };
};

const mergeProps = (stateProps, dispatchProps) => {
  const { onFieldUpdate, onCloseCaptcha, onGetNewCaptcha, _onSubmit } = dispatchProps;
  const {
    title,
    meta,
    captchaText,
    captchaIden,
    captchaImgUrl,
    showCaptcha,
    submissionType,
    readyToPost,
    subreddit,
  } = stateProps;

  return {
    meta,
    title,
    captchaText,
    submissionType,
    readyToPost,
    subreddit,
    captchaImgUrl,
    showCaptcha,
    onFieldUpdate,
    onCloseCaptcha,
    onGetNewCaptcha,
    onSubmit: () => {
      if (!readyToPost) { return; }
      _onSubmit(
        { title, meta, captchaText, captchaIden, sr: subreddit.name, kind: submissionType }
      );
    },
  };
};


export default connect(mapStateToProps, dispatcher, mergeProps)(PostSubmitModal);
