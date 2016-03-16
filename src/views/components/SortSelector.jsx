import React from 'react';
import DropdownController from './dropdown/DropdownController';
import DropdownContent from './dropdown/DropdownContent';
import DropdownRow from './dropdown/DropdownRow';
import { SORTS, SORT_VALUES_MAP } from '../../sortValues';

const T = React.PropTypes;

const getSortValue = sortValue => {
  return SORT_VALUES_MAP[sortValue] ? sortValue : SORTS.CONFIDENCE;
};

export default class SortSelector extends React.Component {
  static propTypes = {
    app: T.object.isRequired,
    sortOptions: T.arrayOf(T.oneOf(Object.values(SORTS))).isRequired,
    sortValue: T.oneOf(Object.values(SORTS)).isRequired,
    onSortChange: T.func.isRequired,
    title: T.string,
  };

  static defaultProps = {
    title: 'Sort by:',
  };

  constructor(props) {
    super(props);

    this.state = {
      dropdownTarget: null,
    };

    this.toggleDropdown = this.toggleDropdown.bind(this);
    this.handleSortClick = this.handleSortClick.bind(this);
    this.renderDropdownRow = this.renderDropdownRow.bind(this);
  }

  toggleDropdown(e) {
    this.setState({
      dropdownTarget: this.state.dropdownTarget ? null : e.target.parentElement,
    });
  }

  handleSortClick(newSortValue) {
    this.setState({
      dropdownTarget: null,
    });

    if (newSortValue !== this.props.sortValue) {
      this.props.onSortChange(newSortValue);
    }
  }

  render() {
    const { dropdownTarget } = this.state;

    return (
      <div className='SortSelector'>
        { this.renderCurrentSort() }
        { dropdownTarget ? this.renderDropdown() : null }
      </div>
    );
  }

  renderCurrentSort() {
    const sortValue = getSortValue(this.props.sortValue);
    const { text, icon } = SORT_VALUES_MAP[sortValue];

    return (
      <div className='SortSelector__currentSort'>
        <div className='SortSelector__currentSortContent' onClick={ this.toggleDropdown }>
          { icon ? this.renderCurrentIcon() : null }
          <div className='SortSelector__currentText'>{ text }</div>
          <div className='SortSelector__currentCaron icon-caron' />
        </div>
      </div>
    );
  }

  renderCurrentIcon() {
    const sortValue = getSortValue(this.props.sortValue);
    let { icon } = SORT_VALUES_MAP[sortValue];
    if (icon === 'icon-circle') { icon = 'icon-history'; }
    const iconCls = `SortSelector__currentIcon ${icon}`;

    return <div className={ iconCls } />;
  }

  renderDropdown() {
    const { dropdownTarget } = this.state;
    const { app, sortOptions, title } = this.props;

    return (
      <div className='SortSelector__dropdown'>
        <DropdownController
          target={ dropdownTarget }
          app={ app }
          offset={ 8 }
          onClose={ this.toggleDropdown }
        >
          <DropdownContent>
            { title ? <div className='SortSelector__title'>{ title.toUpperCase() }</div> : null }
            { sortOptions.map(this.renderDropdownRow) }
          </DropdownContent>
        </DropdownController>
      </div>
    );
  }

  renderDropdownRow(sortName) {
    const sortValue = getSortValue(this.props.sortValue);
    const selected = sortName === sortValue;

    let icon = SORT_VALUES_MAP[sortName].icon;

    if (icon === 'icon-circle' && selected) {
      icon = 'icon-check-circled';
    }

    let iconCls = `SortSelector__dropdownIcon ${icon}`;
    let textCls = 'SortSelector__dropdownText';

    if (sortName === sortValue) {
      iconCls += ' m-selected';
      textCls += ' m-selected';
    }

    if (!icon) {
      iconCls += ' m-no-icon';
    }

    // define callbacks
    const handleClick = this.handleSortClick.bind(this, sortName);

    return (
      <DropdownRow
        key={ sortName }
        onClick={ handleClick }
      >
        { SORT_VALUES_MAP[sortName].icon ? <div className={ iconCls } /> : null }
        <div className={ textCls }>{ SORT_VALUES_MAP[sortName].text }</div>
      </DropdownRow>
    );
  }
}
