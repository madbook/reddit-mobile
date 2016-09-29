import merge from '@r/platform/merge';

import * as modalActions from 'app/actions/modal';
import * as reportingActions from 'app/actions/reporting';


export const DEFAULT = {
  type: null,
  props: {},
};

export default (state=DEFAULT, action={}) => {
  switch (action.type) {
    case reportingActions.REPORT:
      return merge(state, { type: action.modalType, props: action.modalProps });

    case modalActions.CLOSE:
      return merge(state, { type: null, props: {} });

    default:
      return state;
  }
};
