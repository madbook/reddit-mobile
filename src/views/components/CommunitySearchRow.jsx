import React from 'react';

import querystring from 'querystring';
import BaseComponent from './BaseComponent';

class CommunitySearchRow extends BaseComponent {
  constructor(props) {
    super(props);

    this.state.hasInput = false;

    this._goto = this._goto.bind(this);
    this._handleInputChange = this._handleInputChange.bind(this);
  }

  render() {
    let navArrowClassName = 'icon-nav-arrowforward';
    if (this.state.hasInput) {
      navArrowClassName += ' blue';
    }

    return (
      <li className='OverlayMenu-row bottom bottom-border'>
        <form className='OverlayMenu-form' method='GET' action='/goto' onSubmit={ this._goto }>
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
        </form>
      </li>
    );
  }

  _goto(e) {
    e.preventDefault();
    const location = this.refs.location.value.trim();
    const query = querystring.stringify({ location });
    const url = `/goto?${query}`;
    this.props.app.redirect(url);
  }

  _handleInputChange() {
    const hasInput = !!this.refs.location.value.trim();
    this.setState({ hasInput });
  }
}

export default CommunitySearchRow;
