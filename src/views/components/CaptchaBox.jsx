import React from 'react';

import BaseComponent from './BaseComponent';

class CaptchaBox extends BaseComponent {
  static propTypes = {
    action: React.PropTypes.func.isRequired,
    actionName: React.PropTypes.string.isRequired,
    answer: React.PropTypes.string.isRequired,
    cb: React.PropTypes.func.isRequired,
  };
  
  constructor(props) {
    super(props);

    this.state = {
      captchaSrc: '',
      iden: this.props.iden || '',
    };

    if (props.iden) {
      this.state.captchaSrc = this._makeCaptchaUrl(this.state.iden);
    }

    this.newCaptcha = this.newCaptcha.bind(this);
    this._updateCaptchaInfo = this._updateCaptchaInfo.bind(this);
  }

  componentDidMount() {
    if (!this.state.iden) {
      this.requestCaptcha();
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.iden === '') {
      this.requestCaptcha();
    }
  }

  requestCaptcha() {
    const api = this.props.app.api;

    const options = api.buildOptions(this.props.apiOptions);
    options.form = {};
    options.form.api_type = 'json';

    api.captcha.post(options).then(function(data) {
      const iden = data.iden;
      const src = this._makeCaptchaUrl(iden);

      this.setState({
        iden,
        captchaSrc: src,
      });

      this.props.cb({
        iden: this.state.iden,
        answer: '',
      });

    }.bind(this));
  }

  _makeCaptchaUrl (iden) {
    return `https://www.reddit.com/captcha/${iden}`;
  }

  newCaptcha() {
    this.requestCaptcha();
  }

  _updateCaptchaInfo() {
    const answer = this.refs.answer.value;
    const { iden } = this.state;

    const info = {
      answer,
      iden,
    };

    this.props.cb(info);
  }

  render() {
    const errorClass = this.props.error ? 'has-error' : '';
    const errorText = errorClass ? '' : 'visually-hidden';

    let img = (
      <span className='captcha-loading-text'>Loading...</span>
    );

    if (this.state.captchaSrc) {
      img = (
        <img width='120' height='50' src={ this.state.captchaSrc } />
      );
    }

    return (
      <div className={ `captcha-wrap ${errorClass}` }>
        <div className='captcha-img-wrap'>
          { img }
        </div>
        <div >
          <input
            className='form-control'
            ref='answer'
            type='text'
            onChange={ this._updateCaptchaInfo }
            defaultValue={ this.props.answer }
          />
        </div>
        <div className='captcha-new-link'>
          <p
            className={ `text-danger ${errorText}` }
          >That did not seem to match. Please try again.</p>
          <a href='#' onClick={ this.newCaptcha }>get a new code</a>
        </div>
        <button
          type='button'
          className='btn btn-primary btn-block'
          onClick={ this.props.action }
        >{ this.props.actionName }</button>
      </div>
    );

  }

}

export default CaptchaBox;
