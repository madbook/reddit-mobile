import './styles.less';
import React from 'react';
import { DropdownRow } from 'app/components/Dropdown';

const T = React.PropTypes;

const statusText = {
  spam: 'Removed as spam',
  removed: 'Removed',
  approved: 'Approved',
};

export function ModalBanner(props) {
  const {
    pageName,
    status,
    statusBy,
  } = props;

  let bannerText = (
    status && statusBy
    ? `${statusText[status]} by ${statusBy}`
    : null
  );

  return (
    <div className={ `ModalBanner m-${status} ${pageName}` }>
      <DropdownRow
        text={ bannerText }
      />
    </div>
  );
}

ModalBanner.propTypes = {
  pageName: T.string,
  status: T.oneOf(Object.keys(statusText)),
  statusBy: T.string,
};

ModalBanner.defaultProps = {
  pageName: null,
  status: null,
  statusBy: null,
};
