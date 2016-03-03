import React from 'react';

const T = React.PropTypes;

function focusInput(x) {
  if (x) { x.focus(); }
}

export default class SearchBar extends React.Component {
  static propTypes = {
    onSubmit: T.func.isRequired,
    onClear: T.func.isRequired,
    formUrl: T.string,
    initialValue: T.string,
    placeholder: T.string,
  };

  static defaultProps = {
    formUrl: '',
    initialValue: '',
    placeholder: 'Search Reddit',
  };

  constructor(props) {
    super(props);

    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.handleResetInput = this.handleResetInput.bind(this);
  }

  componentDidMount() {
    focusInput(this.refs.input);
  }

  handleResetInput() {
    this.refs.input.value = '';
    focusInput(this.refs.input);
    this.props.onClear();
  }

  handleFormSubmit(e) {
    e.preventDefault();
    this.props.onSubmit(this.refs.input.value);
  }

  render() {
    const { placeholder, initialValue, formUrl } = this.props;

    return (
      <form
        className='SearchBar'
        action={ formUrl }
        method='GET'
        onSubmit={ this.handleFormSubmit }
      >
        <input
          className='SearchBar__input'
          defaultValue={ initialValue }
          name='q'
          placeholder={ placeholder }
          ref='input'
          type='search'
        />
        <div
          className='SearchBar__reset icon-x-circled'
          onClick={ this.handleResetInput }
        />
      </form>
    );
  }
}
