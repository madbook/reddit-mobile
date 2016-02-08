import React from 'react';

import { SORTS } from '../../sortValues';

import BaseComponent from './BaseComponent';
import DropdownController from './dropdown/DropdownController';
import DropdownContent from './dropdown/DropdownContent';
import DropdownRow from './dropdown/DropdownRow';
import SortSelector from './SortSelector';

const T = React.PropTypes;

const activityMap = {
  comments: 'Submitted comments',
  submitted: 'Submitted posts',
  overview: 'Comments and posts',
  gilded: 'Gilded',
};

const commentSortOptions = [
  SORTS.CONFIDENCE,
  SORTS.TOP,
  SORTS.NEW,
  SORTS.CONTROVERSIAL,
  SORTS.QA,
];

const postSortOptions = [
  SORTS.HOT,
  SORTS.TOP,
  SORTS.NEW,
  SORTS.CONTROVERSIAL,
];

export default class UserActivitySubnav extends BaseComponent {
  static propTypes = {
    name: T.string.isRequired,
    onSortChange: T.func.isRequired,
    onActivitySortChange: T.func.isRequired,
    user: T.object,
    sort: T.oneOf(Object.values(SORTS)),
    activity: T.string,
  };

  constructor(props) {
    super(props);

    this.state = {
      sort: props.sort || SORTS.HOT,
      activity: props.activity || 'comments',
      activityDropdownTarget: null,
    };

    this.handleSortChange = this.handleSortChange.bind(this);
    this.toggleActivitySort = this.toggleActivitySort.bind(this);
    this.renderActivityRow = this.renderActivityRow.bind(this);
  }

  handleSortChange(newSort) {
    if (this.state.sort !== newSort) {
      this.setState({ sort: newSort });
      this.props.onSortChange({
        sort: newSort,
        activity: this.state.activity,
      });
    }
  }

  handleActivitySortClick(newActivitySort) {
    if (this.state.activity !== newActivitySort) {
      const sortOptions = newActivitySort === 'comments'
        ? commentSortOptions
        : postSortOptions;

      let newSort = this.state.sort;
      // guard against wrong state. when can this happen? one example: if a user
      // is sorting comments with the CONFIDENCE sort, but switches to sorting
      // posts, the CONFIDENCE sort is no longer relevant.
      if (sortOptions.indexOf(newSort) < 0) { newSort = sortOptions[0]; }

      this.setState({
        sort: newSort,
        activity: newActivitySort,
      });

      this.props.onActivitySortChange({
        sort: newSort,
        activity: newActivitySort,
      });
    }
  }

  toggleActivitySort(e) {
    this.setState({
      activityDropdownTarget: this.state.activityDropdownTarget ? null : e.target.parentElement,
    });
  }

  render() {
    const { activityDropdownTarget } = this.state;

    return (
      <div className='TopSubnav'>
        { this.renderSortDropdown() }
        { this.renderActivitySort() }
        <div className='pull-right'>{ this.renderUserLink() }</div>
        { activityDropdownTarget ? this.renderActivityDropdown() : null }
      </div>
    );
  }

  renderSortDropdown() {
    const { app, activity } = this.props;
    // we want to present different sort options depending on the acitivity type
    // to mimic the actual sort options the user would see when sorting each
    // resource type.
    const sortOptions = activity === 'comments' ? commentSortOptions : postSortOptions;

    let { sort } = this.state;
    // guard against wrong state. see comment in handleActivitySortClick for
    // an example. we repeat the guard in the render function to handle the
    // initial render case.
    if (sortOptions.indexOf(sort) < 0) { sort = sortOptions[0]; }

    return (
      <div className='TopSubnav__sortDropdown'>
        <SortSelector
          app={ app }
          sortValue={ sort }
          sortOptions={ sortOptions }
          onSortChange={ this.handleSortChange }
        />
      </div>
    );
  }

  renderActivitySort() {
    const { activity } = this.state;

    return (
      <div className='TopSubnav__sortDropdown'>
        <div className='TopSubnav__activitySort' onClick={ this.toggleActivitySort }>
          <div className='TopSubnav__activitySortText'>{ activityMap[activity] }</div>
          <div className='TopSubnav__activitySortIcon icon-caron' />
        </div>
      </div>
    );
  }

  renderUserLink() {
    const { user, app } = this.props;

    if (user) {
      return (
        <a
          className='TopSubnav__a'
          href={ `/u/${user.name}` }
        >
          { user.name }
        </a>
      );
    }

    return (
      <a
        className='TopSubnav__a'
        href={ app.config.loginPath }
      >
        Log in / Register
      </a>
    );
  }

  renderActivityDropdown() {
    const { app } = this.props;
    const { activityDropdownTarget } = this.state;

    return (
      <DropdownController
        target={ activityDropdownTarget }
        app={ app }
        offset={ 8 }
        onClose={ this.toggleActivitySort }
      >
        <DropdownContent>
          { Object.keys(activityMap).map(this.renderActivityRow) }
        </DropdownContent>
      </DropdownController>
    );
  }

  renderActivityRow(sortName) {
    // define callback
    const handleSortClick = this.handleActivitySortClick.bind(this, sortName);

    return (
      <DropdownRow
        key={ sortName }
        onClick={ handleSortClick }
      >
        { activityMap[sortName] }
      </DropdownRow>
    );
  }
}
