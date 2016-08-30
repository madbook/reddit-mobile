import React from 'react';

import config from '../../config';

import MessageNav from '../components/MessageNav';
import BasePage from './BasePage';

const COMPOSE_LINK = `${config.reddit}/message/compose`;

class MessageComposePage extends BasePage {
  render () {
    return (
      <div className={ `message-page message-${this.props.view}` }>
        <div>
          <MessageNav {...this.props} user={ this.state.data.user } />
          <div className='container'>
            <div className='row'>
              <div className='col-xs-12 col-sm-6'>
                <div className='well well-lg'>
                  <h3>
                    Sorry, this isn’t ready yet! You can
                    <a href={ COMPOSE_LINK }> compose a message on the desktop site </a>
                    instead.
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default MessageComposePage;
