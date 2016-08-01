import React from 'react';
import { TooltipTarget } from '@r/widgets/tooltip';

import './styles.less';
import { SORTS, SORT_VALUES_MAP } from 'app/sortValues';
import { Dropdown, DropdownRow } from 'app/components/Dropdown';

const T = React.PropTypes;

const getSortValue = sortValue => {
  return SORT_VALUES_MAP[sortValue] ? sortValue : SORTS.CONFIDENCE;
};

export default function SortSelector(props) {
  const {
    id,
    sortOptions,
    sortValue,
    onSortChange,
    title,
    className,
  } = props;

  return (
    <div className={ `SortSelector ${className}` }>
      <TooltipTarget
        id={ id }
        type={ TooltipTarget.TYPE.CLICK }
      >
        { renderCurrentSort(sortValue) }
      </TooltipTarget>
      <Dropdown id={ id } >
        { title &&
          <div className='SortSelector__title'>
            { title.toUpperCase() }
            <div className='SortSelector__title-separator' />
          </div> }
        { renderSortOptions(sortOptions, sortValue, onSortChange) }
      </Dropdown>
    </div>
  );
}

const renderCurrentSort = currentSortValue => {
  const sortValue = getSortValue(currentSortValue);
  const { text, icon } = SORT_VALUES_MAP[sortValue];

  return (
    <div className='SortSelector__currentSort'>
      { icon && renderCurrentIcon(sortValue) }
      <span className='SortSelector__currentText'>{ text }</span>
      <span className='SortSelector__currentCaron icon icon-caron' />
    </div>
  );
};

const renderCurrentIcon = sortName => {
  let { icon } = SORT_VALUES_MAP[sortName];
  if (icon === 'circle') { icon = 'history'; }
  return <span className={ `SortSelector__currentIcon icon icon-${icon}` } />;
};

const renderSortOptions = (sortOptions, sortValue, onSortChange) => {
  const currentSortValue = getSortValue(sortValue);

  return sortOptions.map((sortName) => {
    const selected = sortName === currentSortValue;

    const { icon, text } = SORT_VALUES_MAP[sortName];
    const iconName = icon === 'circle' && selected ? 'check-circled' : icon;

    return (
      <DropdownRow
        key={ sortName }
        onClick={ () => {
          if (!selected) {
            onSortChange(sortName);
          }
        } }
        icon={ iconName }
        text={ text }
        isSelected={ selected }
      />
    );
  });
};

SortSelector.sortType = T.oneOf(Object.values(SORTS));
SortSelector.sortOptionsType = T.arrayOf(SortSelector.sortType);

SortSelector.propTypes = {
  className: T.string,
  id: T.string.isRequired, // Tooltip target id
  sortOptions: SortSelector.sortOptionsType.isRequired,
  sortValue: SortSelector.sortType.isRequired,
  onSortChange: T.func.isRequired,
  title: T.string,
};

SortSelector.defaultProps = {
  className: '',
  title: 'Sort by:',
  onSortChange: () => {},
};
