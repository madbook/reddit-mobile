import React from 'react';
import { models } from 'snoode';

var d = new Date();
var year = d.getFullYear();

class Actions extends React.Component {
  constructor(props) {
    super(props);
  }

  shouldComponentUpdate () {
    return false;
  }

  render () {
    return (
      <ul className='dropdown-menu' role='menu' aria-labelledby='dropdownMenu1'>
        <li className='disabled'>
          <a href='#' role='menuitem' tabIndex='-1'>
            <span className='glyphicon glyphicon-gilded' />
            gild
          </a>
        </li>
        <li role='presentation' className='disabled'>
          <a role='menuitem' tabIndex='-1' href='#'>share</a>
        </li>
        <li role='presentation' className='disabled'>
          <a role='menuitem' tabIndex='-1' href='#'>save</a>
        </li>
        <li role='presentation' className='divider'></li>
        <li role='presentation' className='disabled'>
          <a role='menuitem' tabIndex='-1' href='#' className='text-danger'>report</a>
        </li>
      </ul>
    );
  }
}

function ActionsFactory(app) {
  return app.mutate('core/components/actions', Actions);
}

export default ActionsFactory;
