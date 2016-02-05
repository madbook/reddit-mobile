import React from 'react';
import fill from 'lodash/array/fill';

import short from '../../../lib/formatDifference';

const T = React.PropTypes;
const separator = <div className='CommentHeader__separator'> • </div>;

function getAuthorIcon(authorType) {
  switch (authorType) {
    case 'self': return 'user-account';
    case 'moderator': return 'mod';
    case 'admin': return 'snoosilhouette';
    case 'op': return 'op';
    default: return '';
  }
}

function renderDots(count) {
  const content = fill(Array(count), '•').join(' ');

  return <div className='CommentHeader__dots'>{ content }</div>;
}

function renderCaron(collapsed, dots, highlight) {
  const style = dots ? {width: 26 + (10 * dots)} : null;

  let headerCls = 'CommentHeader__caron icon-caron-circled tween';
  if (collapsed) { headerCls += ' m-collapsed'; }
  if (highlight) { headerCls += ' m-highlight'; }

  return (
    <td className='CommentHeader__col1' style={ style }>
      { dots ? renderDots(dots) : null }
      <div className={ headerCls } />
    </td>
  );
}

function renderInfo(author, flair, created, authorType, highlight, stickied) {
  const authorIcon = getAuthorIcon(authorType);
  const authorIconCls = `CommentHeader__usernameIcon icon-${authorIcon}`;

  let usernameCls = 'CommentHeader__username';
  if (highlight) {
    usernameCls += ' m-highlight';
  } else if (authorType) {
    usernameCls += ` m-${authorType}`;
  }

  return (
    <td className='CommentHeader__col2'>
      <div className={ usernameCls }>
        { stickied ? <div className='CommentHeader__sticky icon-sticky' /> : null }
        { author }
        { authorIcon ? <div className={ authorIconCls }/> : null }
      </div>
      { flair ? renderFlair(flair, highlight) : null }
      { separator }
      { renderTimestamp(created, highlight) }
    </td>
  );
}

function renderFlair(flair, highlight) {
  let cls = 'CommentHeader__flair';
  if (highlight) { cls += ' m-highlight'; }

  return <div className={ cls }>{ flair }</div>;
}

function renderTimestamp(created, highlight) {
  let cls = 'CommentHeader__timestamp';
  if (highlight) { cls += ' m-highlight'; }

  return <div className={ cls }>{ short(created * 1000) }</div>;
}

function renderGold(gildCount) {
  return (
    <td className='CommentHeader__col3'>
      { renderGoldIcon() }
      { gildCount > 1 ? renderGoldCount(gildCount) : null }
    </td>
  );
}

function renderGoldIcon() {
  return <div className='CommentHeader__gold icon-gold-circled'></div>;
}

function renderGoldCount(gildCount) {
  return <div className='CommentHeader__goldCount'>{ gildCount }</div>;
}

function CommentHeader(props) {
  const {
    collapsed,
    dots,
    highlight,
    author,
    flair,
    created,
    authorType,
    gildCount,
    stickied,
  } = props;

  return (
    <div className='CommentHeader'>
      <table className='CommentHeader__table'>
        <tbody>
          <tr>
            { renderCaron(collapsed, dots, highlight) }
            { renderInfo(author, flair, created, authorType, highlight, stickied) }
            { gildCount ? renderGold(gildCount) : null }
          </tr>
        </tbody>
      </table>
    </div>
  );
}

CommentHeader.propTypes = {
  author: T.string.isRequired,
  created: T.number.isRequired,
  authorType: T.string,
  flair: T.string,
  gildCount: T.number,
  collapsed: T.bool,
  dots: T.number,
  highlight: T.bool,
  stickied: T.bool,
};

CommentHeader.defaultProps = {
  gildCount: 0,
  collapsed: false,
  authorType: '',
  dots: 0,
  highlight: false,
  stickied: false,
};

export default CommentHeader;
