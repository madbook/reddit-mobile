import './styles.less';

import React from 'react';
import { Anchor, Form } from '@r/platform/components';

export default function NSFWInterstitial() {
  return (
    <div className='NSFWInterstitial'>
      <div className='NSFWInterstitial__icon-wrapper'>
        <span className='NSFWInterstitial__icon icon icon-header-18plus nsfw' />
      </div>
      <h3 className='NSFWInterstitial__header'>
        You must be 18+ to view this community
      </h3>
      <p className='NSFWInterstitial__text'>
        You must be at least eighteen years old to view this content.
        Are you over eighteen and willing to see adult content?
      </p>
      <div className='NSFWInterstitial__buttons'>
        <Anchor href='/' className='NSFWInterstitial__button'>
          NO THANK YOU
        </Anchor>
        <Form
          action='/actions/setOver18'
          className='NSFWInterstitial__form'
        >
          <button type='submit' className='NSFWInterstitial__button'>
            CONTINUE
          </button>
        </Form>
      </div>
    </div>
  );
}
