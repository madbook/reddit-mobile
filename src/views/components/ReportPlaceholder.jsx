import React from 'react';

class ReportPlaceholder extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      show: true,
    };

    this._fade = this._fade.bind(this);
    this._close = this._close.bind(this);
  }

  shouldComponentUpdate (nextProps, nextState) {
    return (nextProps !== this.props || nextState !== this.state);
  }

  componentDidMount() {
    global.setTimeout(this._fade, 4000);
  }

  _fade() {
    this.setState({
      show: false,
    });

    global.setTimeout(this._close, 250);
  }

  _close() {
    this.setState({ closed: true });
  }

  render() {
    var fadeClass = '';

    if(this.state.closed) {
      return (<div />);
    }

    if (!this.state.show) {
      fadeClass = 'fade-out';
    }

    return (
      <div className={`listing-alert alert alert-danger ${fadeClass}`} role='alert'>
        <div className='container'>
          <button type='button' className='close' onClick={ this._close }>
            <span aria-hidden='true'>&times;</span>
          </button>

          <p>
            report sent
          </p>
        </div>
      </div>
    );
  }
}

export default ReportPlaceholder;
