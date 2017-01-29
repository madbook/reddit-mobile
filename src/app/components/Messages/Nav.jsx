import './Nav.less';
import React from 'react';

import { Anchor } from 'platform/components';

const T = React.PropTypes;

const TYPES = [
  { type: 'messages', text: 'MESSAGES', icon: 'icon-message' },
  { type: 'comments', text: 'COMMENTS', icon: 'icon-comment' },
  { type: 'selfreply', text: 'POST REPLIES', icon: 'icon-post' },
  { type: 'mentions', text: 'MENTIONS', icon: 'icon-crown' },
];

export default function MessagesNav(props) {
  return (
    <div className='MessagesNav'>
      { TYPES.map(data => renderNavItem(data, props.currentMailType)) }
    </div>
  );
}

MessagesNav.propTypes = {
  currentMailType: T.string.isRequired,
};

const renderNavItem = ({ type, text, icon }, currentType) => (
  <Anchor
    className={ `MessagesNav__item ${ type === currentType ? 'm-selected' : '' }` }
    href={ `/message/${ type }` }
  >
    <div className={ `MessagesNav__icon icon ${ icon }` }/>
    <div className='MessagesNav__text'>{ text }</div>
  </Anchor>
);
