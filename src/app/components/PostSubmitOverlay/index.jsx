import React from 'react';
import { Anchor } from '@r/platform/components';

import OverlayMenu from 'app/components/OverlayMenu';

import './styles.less';

export default function PostSubmitOverlay({ subredditName }) {
  const basePath = subredditName ? `/r/${subredditName}/submit` : '/submit';
  return (
    <OverlayMenu>
      <div className='PostSubmitOverlay'>
        <div className='PostSubmitOverlay__icons'>
          <Anchor
            className='PostSubmitOverlay__icon'
            href={ `${basePath}?type=self` }
          >
            <div className='icon icon-post-text'></div>
            <div className='PostSubmitOverlay__icon-text'>TEXT</div>
          </Anchor>
          <Anchor
            className='PostSubmitOverlay__icon'
            href={ `${basePath}?type=link` }
          >
            <div className='icon icon-post-link'></div>
            <div className='PostSubmitOverlay__icon-text'>LINK</div>
          </Anchor>
        </div>
      </div>
    </OverlayMenu>
  );
}
