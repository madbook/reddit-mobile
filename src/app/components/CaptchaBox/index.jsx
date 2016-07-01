import React from 'react';

import './styles.less';

const T = React.PropTypes;

const INPUT_PLACEHOLDER = 'What do you see above?';

const CaptchaBox = props => {
  const {
    captchaText,
    captchaImgUrl,
    onCloseCaptcha,
    onFieldUpdate,
    onGetNewCaptcha,
    onSubmit,
  } = props;

  return (
    <div className='CaptchaBox'>
      <div onClick={ onCloseCaptcha } className='icon icon-nav-close icon-large'></div>
      <div className='CaptchaBox__question'>
        Ok, one more thing... You're human right?
      </div>
      <div className='CaptchaBox__captcha'>
        <img src={ captchaImgUrl } />
      </div>
      <div className='CaptchaBox__input'>
        <input
          onChange={ onFieldUpdate.bind(this, 'captchaText') }
          placeholder={ INPUT_PLACEHOLDER }
          value={ captchaText }
        />
      </div>
      <div className='CaptchaBox__new-code' onClick={ onGetNewCaptcha }></div>
      <button className='CaptchaBox__submit' onClick={ onSubmit }>POST</button>
    </div>
  );
};

CaptchaBox.propTypes = {
  captchaText: T.string.isRequired,
  captchaImgUrl: T.string.isRequired,
  onCloseCaptcha: T.func.isRequired,
  onFieldUpdate: T.func.isRequired,
  onGetNewCaptcha: T.func.isRequired,
  onSubmit: T.func.isRequired,
};

export default CaptchaBox;
