import './styles.less';

import React from 'react';
import { Form } from '@r/platform/components';

const T = React.PropTypes;

function focusInput(x) {
  if (x) { x.focus(); }
}

export default class SearchBar extends React.Component {
  static propTypes = {
//    onClear: T.func.isRequired, // TODO: uncomment this when we have tracking?
    subreddit: T.string,
    initialValue: T.string,
    placeholder: T.string,
  };

  static defaultProps = {
    subreddit: '',
    initialValue: '',
    placeholder: 'Search Reddit',
  };

  constructor(props) {
    super(props);

    this.handleResetInput = this.handleResetInput.bind(this);
  }

  componentDidMount() {
    focusInput(this.refs.input);
  }

  handleResetInput() {
    this.refs.input.value = '';
    focusInput(this.refs.input);
    // this.props.onClear(); // TODO: wire-up tracking
  }

  render() {
    const { placeholder, initialValue, subreddit } = this.props;

    return (
      <Form
        className='SearchBar'
        action={ '/search' }
      >
        <input type='hidden' name='subreddit' value={ subreddit } />
        <input
          className='SearchBar__input'
          defaultValue={ initialValue }
          name='q'
          placeholder={ placeholder }
          ref='input'
          type='search'
        />
        <div
          className='SearchBar__reset icon icon-x-circled'
          onClick={ this.handleResetInput }
        />
      </Form>
    );
  }
}
