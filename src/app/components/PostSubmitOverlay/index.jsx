import React from 'react';
import { Anchor } from '@r/platform/components';

import OverlayMenu from 'app/components/OverlayMenu';

import './styles.less';

export default function PostSubmitOverlay() {
  return (
    <OverlayMenu>
      <div className='PostSubmitOverlay'>
        <div className='PostSubmitOverlay__icons'>
          <Anchor
            className='PostSubmitOverlay__icon'
            href='/submit'
          >
            <div className='icon icon-post-text'></div>
            <div className='PostSubmitOverlay__icon-text'>TEXT</div>
          </Anchor>
          <Anchor className='PostSubmitOverlay__icon'>
            <div className='icon icon-post-image'></div>
            <div className='PostSubmitOverlay__icon-text'>IMAGE</div>
          </Anchor>
          <Anchor className='PostSubmitOverlay__icon'>
            <div className='icon icon-post-link'></div>
            <div className='PostSubmitOverlay__icon-text'>LINK</div>
          </Anchor>
        </div>
      </div>
    </OverlayMenu>
  );
}
