import React from 'react';
import { connect } from 'react-redux';

import * as themeActions from '../../actions/themeActions';

export const TopNav = (props) => {
  return (
  <nav className='TopNav'>
    <button onClick={ props.setDayTheme }>Day Theme</button>
    <button onClick={ props.setNightTheme }>Night Theme</button>
  </nav>
);}

const mapDispatchToProps = (dispatch) => ({
  setDayTheme: () => dispatch(themeActions.setTheme(themeActions.DAYMODE)),
  setNightTheme: () => dispatch(themeActions.setTheme(themeActions.NIGHTMODE)),
});

export default connect(() => ({}), mapDispatchToProps)(TopNav);
