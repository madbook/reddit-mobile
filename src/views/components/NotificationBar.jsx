import React from 'react';

function NotificationBar (props) {
  return (
    <div className={ `alert alert-${props.type} alert-bar` } role='alert'>
      { props.message }
    </div>
  );
}

export default NotificationBar;
