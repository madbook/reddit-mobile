import React from 'react';
import formatNumber from '../../../lib/formatNumber';
import NSFWFlair from '../NSFWFlair';

import constants from '../../../constants';
const { NIGHTMODE } = constants.themes;

const T = React.PropTypes;

function renderIcon(iconUrl, url, color, theme) {
  let style;
  if (color) {
    if (theme === NIGHTMODE && !iconUrl) {
      style = { borderColor: color };
    } else {
      style = { backgroundColor: color };
    }
  }

  return (
    <a className='CommunityRow__icon' href={ url }>
      { iconUrl
        ? <img className='CommunityRow__iconImg' src={ iconUrl } style={ style }/>
        : <div className='CommunityRow__iconBlank' style={ style }/> }
    </a>
  );
}

function renderDetails(data) {
  const { display_name, subscribers, accounts_active, url, over18 } = data;

  return (
    <a className='CommunityRow__details' href={ url }>
      <div className='CommunityRow__name'>
        <span className='CommunityRow__rSlash'>r/</span>
        { display_name }
        { over18 ? NSFWFlair : null }
      </div>
      <div className='CommunityRow__counts'>
        { [subscribers, accounts_active]
          .filter(x => !!x)
          .map(formatNumber)
          .map((num, idx) => idx === 0 ? `${num} followers` : `${num} online`)
          .join(' • ') }
      </div>
    </a>
  );
}

function renderAdd(data, subscribed, onToggleSubscribe) {
  const { name, url } = data;
  const id = url.split('/')[2].toLowerCase();

  function clickCallback() {
    onToggleSubscribe({ id, name, subscribe: !subscribed });
  }

  return (
    <div
      className='CommunityRow__add'
      onClick={ clickCallback }
    >
      { subscribed
        ? <div className='CommunityRow__checkIcon icon-check-circled lime'/>
        : <div className='CommunityRow__addIcon icon-follow blue'/> }
    </div>
  );
}

function CommunityRow(props) {
  const { data, subscribed, onToggleSubscribe, theme } = props;

  return (
    <div className='CommunityRow'>
      { renderIcon(data.icon_img, data.url, data.key_color, theme) }
      { renderDetails(data) }
      { renderAdd(data, subscribed, onToggleSubscribe) }
    </div>
  );
}

CommunityRow.propTypes = {
  data: T.object.isRequired,
  onToggleSubscribe: T.func.isRequired,
  subscribed: T.bool,
  theme: T.string,
};

CommunityRow.defaultProps = {
  subscribed: false,
};

export default CommunityRow;
