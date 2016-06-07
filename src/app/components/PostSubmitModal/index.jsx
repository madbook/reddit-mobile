import React from 'react';
import every from 'lodash/every';
import isEmpty from 'lodash/isEmpty';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { Anchor, Form } from '@r/platform/components';

import cx from 'lib/classNames';
import Modal from '../Modal';
import * as postingActions from 'app/actions/posting';
import './styles.less';

const T = React.PropTypes;

const SELECT_COMMUNITY = 'Select a community';
const TITLE_PLACEHOLDER = 'Add an interesting title';
const TITLE_TEXT = { self: 'Text', link: 'Link', image: 'Image' };

class PostSubmitModal extends React.Component {
  static propTypes = {
    readyToPost: T.bool.isRequired,
    subreddit: T.object.isRequired,
    title: T.string.isRequired,
    meta: T.string.isRequired,
    onFieldUpdate: T.func.isRequired,
    submissionType: T.oneOf(Object.keys(TITLE_TEXT)),
  };

  static defaultProps = {
    submissionType: 'self',
  };

  render() {
    const { submissionType, readyToPost: ready } = this.props;
    const title = TITLE_TEXT[submissionType];
    const buttonClass = cx('PostSubmitModal__submit-button', { ready });

    return (
      <Modal exitTo='/' titleText={ title }>
        <Form action='/submit' className='PostSubmitModal'>
          <input name='kind' type='hidden' value={ submissionType } />

          <div className='PostSubmitModal__submit'>
            <button type='submit' className={ buttonClass }>POST</button>
          </div>

          { this.renderSubredditButton() }

          <div className='PostSubmitModal__title'>
            <input
              name='title'
              placeholder={ TITLE_PLACEHOLDER }
              onChange={ this.props.onFieldUpdate.bind(this, 'title') }
            />
          </div>

          <div className='PostSubmitModal__content'>
            { this.chooseContentInput(submissionType) }
          </div>
        </Form>
      </Modal>
    );
  }

  chooseContentInput() {
    switch (this.props.submissionType) {
      case 'self':
        return this.renderTextInput();
      case 'link':
        return this.renderLinkInput();
      case 'image':
        return this.renderImageProgress();
      default:
        return this.renderTextInput();
    }
  }

  renderTextInput() {
    return (
      <div className='PostSubmitModal__content-text'>
        <textarea
          name='text'
          rows='5'
          onChange={ this.onTextareaUpdate.bind(this) }
          placeholder='Add your text...'
        />
      </div>
    );
  }

  renderLinkInput() {
    return (
      <div className='PostSubmitModal__content-link'>
        <input
          name='url'
          placeholder='Paste your link here...'
          onChange={ this.props.onFieldUpdate.bind(this, 'meta') }
        />
      </div>
    );
  }

  renderImageForm() {
    return (
      <div className='PostSubmitModal__content-image'></div>
    );
  }

  renderSubredditButton() {
    const { subreddit: { name, iconUrl } } = this.props;

    const style = iconUrl ? { backgroundImage: `url(${iconUrl})` } : null;
    const text = name ? name : SELECT_COMMUNITY;
    const commClasses = cx('PostSubmitModal__community-text', { 'greyed': !name });

    return (
      <div className='PostSubmitModal__community'>
        <div className='PostSubmitModal__community-snoo-icon'>
          <div className='PostSubmitModal__community-snoo' style={ style }></div>
        </div>
        <input name='sr' type='hidden' value={ name } />
        <Anchor href='/submit/to_community'>
          <div className={ commClasses }>
            { text }
            <div className='icon icon-nav-arrowdown'></div>
          </div>
        </Anchor>
      </div>
    );
  }

  onTextareaUpdate(e) {
    const { target } = e;
    const { scrollHeight } = target;
    const { height } = target.getBoundingClientRect();
    target.style.height = scrollHeight > height ? scrollHeight : height;

    this.props.onFieldUpdate('meta', e);
  }
}


const mapStateToProps = createSelector(
  state => state.posting,
  state => state.subreddits,
  state => state.platform.currentPage.urlParams.subredditName,
  state => state.platform.currentPage.queryParams.type,
  (posting, subreddits, subredditName, submissionType) => {
    const { title, meta } = posting;

    const subredditMetaData = subreddits[subredditName];
    const iconUrl = subredditMetaData ? subredditMetaData.iconImage : null;

    const readyToPost = every(Object.values(posting), v => !isEmpty(v));

    return {
      title,
      meta,
      submissionType,
      readyToPost,
      subreddit: { name: subredditName, iconUrl },
    };
  }
);

const dispatcher = dispatch => ({
  onFieldUpdate: (name, e) => dispatch(postingActions.updateField(name, e.target.value)),
});


export default connect(mapStateToProps, dispatcher)(PostSubmitModal);
