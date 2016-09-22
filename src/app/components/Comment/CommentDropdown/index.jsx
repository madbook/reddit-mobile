import React from 'react';

import { Dropdown, DropdownRow, DropdownLinkRow } from 'app/components/Dropdown';

const T = React.PropTypes;

export default function CommentDropdown(props) {
  const {
    id,
    permalink,
    commentAuthor,
    username,
    isSaved,
    // onEdit,
    onDelete,
    onToggleSave,
  } = props;

  const userIsAuthor = commentAuthor === username;

  return (
    <Dropdown id={ id }>
      { /* comment out the edit option until the feature is build */ }
      {/*{ userIsAuthor
        ? <DropdownRow icon='posts' text='Edit Comment' onClick={ onEdit }/>
        : null }*/}
      { userIsAuthor
        ? <DropdownRow icon='delete_remove' text='Delete Comment' onClick={ onDelete }/>
        : null }
      <DropdownLinkRow href={ permalink } icon='link' text='Permalink'/>
      { username
        ? <DropdownRow icon='save' text={ isSaved ? 'Saved' : 'Save' } isSelected={ isSaved } onClick={ onToggleSave }/>
        : null }
      { !userIsAuthor
        ? <DropdownLinkRow href={ `/user/${commentAuthor}` } icon='user-account' text={ `${commentAuthor}'s profile` }/>
        : null }
      { username
        ? <DropdownLinkRow href='/report' icon='flag' text='Report'/>
        : null }
    </Dropdown>
  );
}

CommentDropdown.propTypes = {
  id: T.string.isRequired,
  permalink: T.string.isRequired,
  commentAuthor: T.string.isRequired,
  username: T.string,
  isSaved: T.bool,
  onEdit: T.func,
  onDelete: T.func,
  onToggleSave: T.func,
};

CommentDropdown.defaultProps = {
  username: '',
  isSaved: false,
  onEdit: () => {},
  onDelete: () => {},
  onToggleSave: () => {},
};
