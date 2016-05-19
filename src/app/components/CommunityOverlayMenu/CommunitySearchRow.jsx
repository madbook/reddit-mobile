import React from 'react';
import { Form } from '@r/platform/components';

export default class CommunitySearchRow extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hasInput: false,
    };

    this._handleInputChange = this._handleInputChange.bind(this);
  }

  render() {
    let navArrowClassName = 'icon icon-nav-arrowforward';
    if (this.state.hasInput) {
      navArrowClassName += ' blue';
    }

    return (
      <li className='OverlayMenu-row bottom bottom-border'>
        <Form className='OverlayMenu-form' action='/actions/community-goto'>
          <div className='OverlayMenu-form-input-group'>
            <label
              className='OverlayMenu-form-label r-label'
              htmlFor='location-input'
            >
              r/
            </label>
            <input
              type='text'
              ref='location'
              className='OverlayMenu-form-input'
              id='location-input'
              placeholder='find a community'
              name='location'
              autoCorrect='off'
              autoCapitalize='off'
              spellCheck='false'
              onChange={ this._handleInputChange }
            />
            <span className='OverlayMenu-form-button right-arrow'>
              <button type='submit' className={ navArrowClassName }></button>
            </span>
          </div>
        </Form>
      </li>
    );
  }

  _handleInputChange() {
    const hasInput = !!this.refs.location.value.trim();
    this.setState({ hasInput });
  }
}
