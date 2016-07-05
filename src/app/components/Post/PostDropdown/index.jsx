import './styles.less';
import React from 'react';
import { Anchor } from '@r/platform/components';

const T = React.PropTypes;

export default function PostDropdown(props) {
  const {
    permalink,
    subreddit,
    author,
    isLoggedIn,
    isSaved,
    onToggleSave,
    onToggleHide,
  } = props;

  return (
    <div className='PostDropdown'>
      { renderLinkRow('Permalink', 'link', permalink) }
      { renderLinkRow(`More from r/${subreddit}`, 'snoosilhouette', `/r/${subreddit}`) }
      { renderLinkRow(`${author}'s profile`, 'user-account', `/u/${author}`) }
      { isLoggedIn ? renderCbRow(isSaved ? 'Saved' : 'Save', 'save', onToggleSave, isSaved) : null }
      { isLoggedIn ? renderCbRow('Hide', 'hide', onToggleHide) : null }
      { isLoggedIn ? renderLinkRow('Report', 'flag', '/report') : null }
    </div>
  );
}

PostDropdown.propTypes = {
  permalink: T.string.isRequired,
  subreddit: T.string.isRequired,
  author: T.string.isRequired,
  isSaved: T.bool,
  isLoggedIn: T.bool,
  onToggleSave: T.func,
  onToggleHide: T.func,
};

PostDropdown.defaultProps = {
  isSaved: false,
  isLoggedIn: false,
  onToggleSave: () => {},
  onToggleHide: () => {},
};

const renderLinkRow = (title, icon, url) => (
  <Anchor href={ url } className='PostDropdown__row'>
    <div className={ `PostDropdown__icon icon icon-${icon}` }/>
    <div className='PostDropdown__iconText'>{ title }</div>
  </Anchor>
);

const renderCbRow = (title, icon, cb, isSelected) => (
  <div className='PostDropdown__row' onClick={ cb }>
    <div className={ `PostDropdown__icon icon icon-${icon} ${isSelected ? 'm-selected' : ''}` }/>
    <div className='PostDropdown__iconText'>{ title }</div>
  </div>
);
