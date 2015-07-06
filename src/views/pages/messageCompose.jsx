import React from 'react';

import BaseComponent from '../components/BaseComponent';

class MessageComposePage extends BaseComponent {
  constructor(props) {
    super(props);
  }

  render () {
    return (
      <div>
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
    );
  }

  static populateData (api, props, synchronous) {
    var defer = q.defer();
    defer.resolve();
    return defer.promise;
  }
};

export default MessageComposePage;
