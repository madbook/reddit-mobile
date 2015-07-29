import BaseComponent from '../components/BaseComponent';
import globals from '../../globals';

class BasePage extends BaseComponent {
  componentDidMount() {
    globals().app.emit('page:update', this.props);
  }
}

export default BasePage;
