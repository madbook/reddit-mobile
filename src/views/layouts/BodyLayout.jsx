import React from 'react';
import TopNavFactory from '../components/TopNav';
import SideNavFactory from '../components/SideNav';

var TopNav;
var SideNav;

class BodyLayout extends React.Component {
  constructor(props) {
    super(props);
  }

  render () {
    return (
      <div>
        <SideNav {...this.props} />
        <TopNav {...this.props}/>
        { this.props.children }
      </div>
    );
  }
}

function BodyLayoutFactory(app) {
  TopNav = TopNavFactory(app);
  SideNav = SideNavFactory(app);

  return app.mutate('core/layouts/body', BodyLayout);
}

export default BodyLayoutFactory;
