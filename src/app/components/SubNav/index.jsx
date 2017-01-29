import './styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { Anchor } from 'platform/components';
import { userAccountSelector } from 'app/selectors/userAccount';

const T = React.PropTypes;

const subnavRightLink = (href, text) => (
  <Anchor href={ href } className='SubNav__a'>
    { text }
  </Anchor>
);

const sidebarOrLoginLink = (rightLink, hasUser) => {
  if (rightLink) {
    return subnavRightLink(rightLink.href, rightLink.text);
  }

  if (!hasUser) {
    return subnavRightLink('/login', 'Log in / Register');
  }
};

export const SubNav = props => {
  const { user, rightLink, showWithoutUser, children } = props;

  if (user && !(rightLink && showWithoutUser) && !children) {
    return null;
  }

  return (
    <nav className='SubNav'>
      <div className='SubNav__leftContent'>
        { children }
      </div>
      <div className='SubNav__navLink'>
        { sidebarOrLoginLink(rightLink, !!user) }
      </div>
    </nav>
  );
};

SubNav.propTypes = {
  rightLink: T.shape({
    href: T.string.isRequired,
    text: T.string.isRequired,
  }),
};

const mapStateToProps = createSelector(
  userAccountSelector,
  user => ({ user }),
);

export default connect(mapStateToProps)(SubNav);
