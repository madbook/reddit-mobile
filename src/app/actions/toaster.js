export const TYPES = {
  ERROR: 'ERROR',
  SUCCESS: 'SUCCESS',
  REPORT_SUCCESS: 'REPORT_SUCCESS',
};

export const CLOSE = 'TOASTER__CLOSE';

export const closeToaster = () => ({ type: CLOSE });
