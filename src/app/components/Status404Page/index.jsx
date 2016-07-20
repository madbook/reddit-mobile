import React from 'react';

import { Anchor } from '@r/platform/components';
import './styles.less';

const GO_BACK = 'Go Back!';
const GO_TO_FRONTPAGE = 'To the front page!';

export default (props) => {
  // NOTE: the second condition is a side-effect of a bug in our platform
  // code, which is setting the url's referrer to itself. Ideally, only the
  // first condition is needed.
  const toFrontpage = props.referrer === '' || props.referrer === props.url;

  const href = toFrontpage ? '/' : props.referrer;
  const content = toFrontpage ? GO_TO_FRONTPAGE : GO_BACK;

  return (
    <div className='Status404Page BelowTopNav'>
      <div className='Status404Page__image' />
      <div className='Status404Page__error'>Page Not Found</div>
      <Anchor href={ href } className='Status404Page__redirect-anchor'>
        { content }
      </Anchor>
    </div>
  );
};
