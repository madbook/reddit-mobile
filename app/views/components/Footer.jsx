/** @jsx React.DOM */

import * as React from 'react';

var d = new Date();
var year = d.getFullYear();

var Footer = React.createClass({
  render: function() {
    return (
      <footer className='footer'>
        <div className='row'>
          <div className='col-xs-12 text-center text-muted small'>
            <p className='bottommenu'>
              Use of this site constitutes acceptance of our
              &nbsp;<a href='https://www.reddit.com/help/useragreement'>User Agreement</a> and
              &nbsp;<a href='https://www.reddit.com/help/privacypolicy'>Privacy Policy</a>.
              © {year} reddit inc. All rights reserved.
            </p>
            <p className='bottommenu'>
              REDDIT and the ALIEN Logo are registered trademarks of reddit inc.
            </p>
          </div>
        </div>
      </footer>
    );
  }
});

export default Footer;
