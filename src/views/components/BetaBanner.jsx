import React from 'react';

import cookies from 'cookies-js';

class BetaBanner extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      show: props.show,
    };
  }

  shouldComponentUpdate (nextProps, nextState) {
    return (nextProps !== this.props || nextState !== this.state);
  }

  _close () {
    let date = new Date();
    date.setFullYear(date.getFullYear() + 2);

    cookies.set('hideBetaBanner', 'true', {
      expires: date,
      secure: this.props.app.getConfig('https') || this.props.app.getConfig('httpsProxy'),
    });

    this.setState({
      show: false,
    });
  }

  render () {
    if (this.state.show) {
      return (
        <div className='jumbotron'>
          <div className='container'>
            <button type='button' className='close' onClick={ this._close.bind(this) }>
              <span aria-hidden='true'>&times;</span>
            </button>

            <h1>Welcome to reddit's new mobile site</h1>
            <p>
              This is in beta, so some features are missing and some stuff is
              broken. Thanks for trying it out! <a href='/faq'>Learn more.</a>
            </p>
          </div>
        </div>
      );
    } else {
      return <div />;
    }
  }
}

export default BetaBanner;
