import React from 'react';

import config from 'config';
import ReCaptcha from 'app/components/ReCaptcha';
import './styles.less';

const T = React.PropTypes;

const ReCaptchaBox = props => {
  const {
    onCloseCaptcha,
    onRecaptchaLoaded,
    onSubmit,
  } = props;

  const { recaptchaSitekey } = config;

  return (
    <div className='ReCaptchaBox'>
      <div onClick={ onCloseCaptcha } className='icon icon-nav-close icon-large'></div>
      <div className='ReCaptchaBox__question'>
        Ok, one more thing... You're human right?
      </div>
      <div className='ReCaptchaBox__captcha'>
        <ReCaptcha
          sitekey={ recaptchaSitekey }
          onSuccess={ value => onRecaptchaLoaded('gRecaptchaResponse', value) }
        />
      </div>
      <button className='ReCaptchaBox__submit' onClick={ onSubmit }>POST</button>
    </div>
  );
};

ReCaptchaBox.propTypes = {
  onCloseCaptcha: T.func.isRequired,
  onRecaptchaLoaded: T.func.isRequired,
  onSubmit: T.func.isRequired,
};

export default ReCaptchaBox;
