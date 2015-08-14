import React from 'react';

import MessageNav from '../components/MessageNav';
import BasePage from './BasePage';

class MessageComposePage extends BasePage {
  render () {
    return (
      <div className={`message-page message-${this.props.view}`}>
        <div>
          <MessageNav {...this.props} user={ this.state.data.user } />
          <div className='container'>
            <div className='row'>
              <div className='col-xs-12 col-sm-6'>
                <div className='well well-lg'>
                  <p>Sorry, this isn’t ready yet!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default MessageComposePage;
