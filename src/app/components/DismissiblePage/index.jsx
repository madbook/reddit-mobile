import './styles.less';
import React from 'react';
import { Anchor } from 'platform/components';

const T = React.PropTypes;

const DismissiblePage = props => (
  <div className='DismissiblePage'>
    <div className='DismissiblePage__menubar'>
      <Anchor href={ props.exitTo } className='DismissiblePage__menubar-close'>
        <span className='icon icon-nav-close icon-large'></span>
      </Anchor>
      <span className='DismissiblePage__menubar-text'>{ props.titleText }</span>
    </div>
    <div className='DismissiblePage__body'>
      { props.children }
    </div>
  </div>
);

DismissiblePage.propTypes = {
  exitTo: T.string.isRequired,
  titleText: T.string,
};

DismissiblePage.defaultProps = {
  titleText: '',
};

export default DismissiblePage;
