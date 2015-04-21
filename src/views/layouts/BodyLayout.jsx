import React from 'react';
import TopNavFactory from '../components/TopNav';
import SideNavFactory from '../components/SideNav';
import BetaBannerFactory from '../components/BetaBanner';
import constants from '../../constants';

var TopNav;
var SideNav;
var BetaBanner;

class BodyLayout extends React.Component {
  constructor(props) {
    super(props);
    this._onCompactToggle = this._onCompactToggle.bind(this);
  }

  render () {
    return (
      <div className='container-with-betabanner'>
        <SideNav {...this.props} />
        <TopNav {...this.props}/>
        <main>
          <BetaBanner show={ this.props.showBetaBanner } />
          { this.props.children }
        </main>
      </div>
    );
  }

  componentDidMount() {
    this.props.app.on(constants.COMPACT_TOGGLE, this._onCompactToggle);
  }

  componentWillUnount() {
    this.props.app.off(constants.COMPACT_TOGGLE, this._onCompactToggle);
  }

  _onCompactToggle() {
    this.forceUpdate();
  }
}

function BodyLayoutFactory(app) {
  TopNav = TopNavFactory(app);
  SideNav = SideNavFactory(app);
  BetaBanner = BetaBannerFactory(app);

  return app.mutate('core/layouts/body', BodyLayout);
}

export default BodyLayoutFactory;
