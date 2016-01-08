import React from 'react';

import TextSubNav from './TextSubNav';

function MessageNav (props) {
  let modMailLink;
  const { view, user } = props;

  if (!user) {
    return (<div />);
  }

  if (user.is_mod) {
    modMailLink= (
      <li className={ `TextSubNav-li ${view === 'moderator' ? 'active' : ''}` }>
        <a
          className='TextSubNav-a'
          href='/message/moderator'
        >Mod Mail</a>
      </li>
    );
  }

  return (
    <TextSubNav>
      <li className={ `TextSubNav-li ${view === 'inbox' ? 'active' : ''}` }>
        <a
          className='TextSubNav-a'
          href='/message/inbox'
        >All</a>
      </li>

      <li className={ `TextSubNav-li ${view === 'messages' ? 'active' : ''}` }>
        <a
          className='TextSubNav-a'
          href='/message/messages'
        >Messages</a>
      </li>

      { modMailLink }
      <li className={ `TextSubNav-li ${view === 'mentions' ? 'active' : ''}` }>
        <a
          className='TextSubNav-a'
          href='/message/mentions'
        >Mentions</a>
      </li>

      <li className={ `TextSubNav-li TextSubNav-icon-li ${view === 'compose' ? 'active' : ''}` }>
        <a
          className='TextSubNav-a'
          href='/message/compose'
        ><span className='icon-post' /></a>
      </li>
    </TextSubNav>
  );
}

MessageNav.propTypes = {
  view: React.PropTypes.string.isRequired,
};

export default MessageNav;
