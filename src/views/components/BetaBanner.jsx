import React from 'react';

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
    var year = (new Date()).getFullYear() + 2;
    document.cookie = `hideBetaBanner=true; expires=Fri, 31 Dec ${year} 23:59:59 GMT`;
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

function BetaBannerFactory(app) {
  return app.mutate('core/components/betaBanner', BetaBanner);
}

export default BetaBannerFactory;
