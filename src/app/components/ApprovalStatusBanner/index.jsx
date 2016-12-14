import './styles.less';
import React from 'react';
import { DropdownRow } from 'app/components/Dropdown';

const T = React.PropTypes;

const statusText = {
  spam: 'Removed as spam',
  removed: 'Removed',
  approved: 'Approved',
};

export function ApprovalStatusBanner(props) {
  const {
    status,
    statusBy,
    pageName,
  } = props;

  const bannerText = `${statusText[status]} by ${statusBy}`;

  if (!status || !statusBy) { return null; }

  return (
    <div className={ `ApprovalStatusBanner m-${status} ${pageName}` }>
      <DropdownRow
        text={ bannerText }
      />
    </div>
  );
}

ApprovalStatusBanner.propTypes = {
  status: T.oneOf(Object.keys(statusText)),
  statusBy: T.string,
  pageName: T.string,
};

ApprovalStatusBanner.defaultProps = {
  status: null,
  pageName: null,
};
