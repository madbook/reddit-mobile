import React from 'react';
import globals from '../../globals';

import BaseComponent from './BaseComponent';
import TextSubNav from './TextSubNav';

class MessageNav extends BaseComponent {
  constructor (props) {
    super(props);
  }

  render () {
    var modMailLink;
    var view = this.props.view;

    if (globals().user.is_mod) {
      modMailLink= (
        <li className='TextSubNav-li' active={view === 'moderator'}>
          <a className={'TextSubNav-a ' + (view === 'moderator' ? 'active' : '') } href='/message/moderator'>Mod Mail</a>
        </li>
      );
    }

    return (
      <TextSubNav>
        <li className='TextSubNav-li' active={view === 'inbox'}>
          <a className={'TextSubNav-a ' + (view === 'inbox' ? 'active' : '') } href='/message/inbox'>All</a>
        </li>

        <li className='TextSubNav-li' active={view === 'messages'}>
          <a className={'TextSubNav-a ' + (view === 'messages' ? 'active' : '') } href='/message/messages'>Messages</a>
        </li>

        { modMailLink }
        <li className='TextSubNav-li' active={view === 'mentions'}>
          <a className={'TextSubNav-a ' + (view === 'mentions' ? 'active' : '') } href='/message/mentions'>Mentions</a>
        </li>

        <li className='TextSubNav-li' active={view === 'compose'}>
          <a className={'TextSubNav-a ' + (view === 'compose' ? 'active' : '') } href='/message/compose'><span className='icon-post' /></a>
        </li>
      </TextSubNav>
    );
  }
}

MessageNav.propTypes = {
  view: React.PropTypes.string.isRequired,
};

export default MessageNav;
