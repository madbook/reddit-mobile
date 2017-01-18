import * as commentActions from 'app/actions/comment';
import * as reportingActions from 'app/actions/reporting';
import * as replyActions from 'app/actions/reply';
import { toggleModal } from '@r/widgets/modal';

export default (dispatch) => ({
  onToggleEditForm: commentId => () => dispatch(commentActions.toggleEdit(commentId)),
  onUpdateBody: commentId => newText => dispatch(commentActions.updateBody(commentId, newText)),
  onDeleteComment: commentId => () => dispatch(commentActions.del(commentId)),
  onToggleSaveComment: commentId => () => dispatch(commentActions.toggleSave(commentId)),
  onToggleCollapse: commentId => () => dispatch(commentActions.toggleCollapse(commentId)),
  onReportComment: commentId => () => dispatch(reportingActions.report(commentId)),
  onToggleReply: commentId => (e) => {
    e.preventDefault();
    dispatch(replyActions.toggle(commentId));
  },
  onToggleModal: () => () => dispatch(toggleModal(null)),
});

export const returnDispatchers = (commentDispatchers, uuid) => {
  return Object
    .keys(commentDispatchers)
    .reduce((prev, key) =>
      ({ ...prev, [key]: commentDispatchers[key](uuid) }), {});
};
