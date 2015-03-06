import React from 'react';
import SortDropdownFactory from '../components/SortDropdown';

var SortDropdown;

class TopSubnav extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    return (
      <div className='TopSubnav'>
          <SortDropdown sort={ this.props.sort } list='comments' baseUrl={ this.props.url }/>
      </div>
    );
  }
}

function TopSubnavFactory(app) {
  SortDropdown = SortDropdownFactory(app);
  return app.mutate('core/components/topSubnav', TopSubnav);
}

export default TopSubnavFactory;