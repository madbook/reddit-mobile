import './styles.less';
import React from 'react';
import { Modal } from '@r/widgets/modal';
import { DropdownClose } from 'app/components/Dropdown';
import { ModalBanner } from 'app/components/ModalBanner';
import { getStatusBy, getApprovalStatus } from 'lib/modToolHelpers.js';
import { USER_REPORT_KEY, MODERATOR_REPORT_KEY } from 'app/reducers/reports';
const T = React.PropTypes;

export function ReportsModal(props) {
  const {
    reports,
    isApproved,
    isRemoved,
    isSpam,
    removedBy,
    approvedBy,
    reportModalId,
    onClick,
  } = props;

  if (!reports) { return null; }

  const status = getApprovalStatus(isApproved, isRemoved, isSpam);
  const statusBy = getStatusBy(isApproved, isRemoved, isSpam, removedBy, approvedBy);
  const modReports = reports[MODERATOR_REPORT_KEY];
  const userReports = reports[USER_REPORT_KEY];

  return (
    <div className='ReportsModal__wrapper' onClick={ onClick }>
      <Modal
        id={ reportModalId }
        className='DropdownModal ReportsModal'
      >
        <DropdownClose onClick={ onClick }/>
        <div className='ReportsModal__row-wrapper' onClick={ onClick }>
          { status && statusBy &&
            <ModalBanner
              status={ status }
              statusBy={ statusBy }
              pageName={ 'moderatorModal' }
            />
          }
          { showModReports(modReports) }
          { showUserReports(userReports) }
        </div>
      </Modal>
    </div>
  );
}

function showModReports(reports) {
  if (reports && Object.keys(reports).length > 0) {
    return (
      <div className='ReportsModal__reports'>
        <div className='m-reports-title'>Moderator Reports:</div>
        {
          Object.keys(reports).map((username) => (
            <div> { `${username}: ${reports[username]}` } </div>
          ))
        }
      </div>
    );
  }
}

function showUserReports(reports) {
  if (reports && Object.keys(reports).length > 0) {
    return (
      <div className='ReportsModal__reports'>
        <div className='m-reports-title'>User Reports:</div>
        {
          Object.keys(reports).map((reason) => (
            <div> { `${reports[reason]}: ${reason}` } </div>
          ))
        }
      </div>
    );
  }
}

ReportsModal.propTypes = {
  onToggleModal: T.func.isRequired,
  reports: T.object,
  isApproved: T.bool,
  isRemoved: T.bool,
  isSpam: T.bool,
  removedBy: T.string,
  approvedBy: T.string,
  reportModalId: T.string,
};

ReportsModal.defaultProps = {
  reports: null,
  isApproved: true,
  isRemoved: false,
  isSpam: false,
  removedBy: null,
  approvedBy: null,
  reportModalId: '',
};
