import React from 'react';

import propTypes from '../../../propTypes';
import short from '../../../lib/formatDifference';
import mobilify from '../../../lib/mobilify';


import {
  isPostNSFW,
} from './postUtils';

const T = React.PropTypes;

const SEPERATOR = (
  <span className='PostHeader__seperator PostHeader__flush-w-icon' />
);

const NSFW_FLAIR = (
  <span className='PostHeader__nsfw-text'>
    <span className='icon-nsfw nsfw' />
    <span className='PostHeader__flush-w-icon'>NSFW</span>
  </span>
);

const STICKY_FLAIR = (
  <span className='icon-sticky lime' />
);

const LOCKED_FLAIR = (
  <span className='icon-lock warning-yellow' />
);

const ADMIN_FLAIR = (
  <span className='icon-snoosilhouette orangered' />
);

const MOD_FLAIR = (
  <span className='icon-mod lime' />
);

const GILDED_FLAIR = (
  <span className='icon-gold-circled gold' />
);

const SPONSORED_FLAIR = (
  <span className='PostHeader__sponsored-flair'>SPONSORED</span>
);

PostHeader.propTypes = {
  post: propTypes.listing.isRequired,
  single: T.bool.isRequired,
  hideSubredditLabel: T.bool.isRequired,
  hideWhen: T.bool.isRequired,
  nextToThumbnail: T.bool.isRequired,
  showingLink: T.bool.isRequired,
};

function postTextColorClass(distinguished) {
  if (distinguished === 'moderator') { return 'PostHeader__mod-text'; }
  if (distinguished === 'admin') { return 'PostHeader__admin-text'; }
}

function isValidKeyColorForRendering(keyColor) {
  // in the future do something fancier with hsl compared to background color... maybe...
  return keyColor !== '#efefed';
}

function subredditLabelIfNeeded(sr_detail, subreddit, hideSubredditLabel, hasDistinguishing) {
  if (hideSubredditLabel || !subreddit) { return; }

  const keyColorStyle = {};
  if (!hasDistinguishing && sr_detail && sr_detail.key_color) {
    if (isValidKeyColorForRendering(sr_detail.key_color)) {
      const { key_color } = sr_detail;
      Object.assign(keyColorStyle, { color: key_color});
    }
  }

  const rSubreddit = `r/${subreddit}`;

  return (
    <a className='PostHeader__subreddit-link' href={ `/${rSubreddit}` } style={ keyColorStyle }>
      { rSubreddit }
    </a>
  );
}

function renderLinkFlairText(post) {
  if (!post.link_flair_text) {
    return;
  }

  return (
    <span className='PostHeader__link-flair' >
      { post.link_flair_text }
    </span>
  );
}

function renderAuthorAndTimeStamp(post, single, hideWhen) {
  const {
    author,
    created_utc,
  } = post;

  const authorLink = (
    <a className='PostHeader__author-link' href={ `/u/${author}` }>
      { `u/${author}` }
    </a>
  );

  if (hideWhen) {
    return authorLink;
  }

  if (single) {
    return (
      <span>
        { authorLink }
        { SEPERATOR }
        { short(created_utc * 1000) }
      </span>
   );
  }

  return (
    <span>
      { short(created_utc * 1000) }
      { SEPERATOR }
      { authorLink }
    </span>
 );
}

function renderPostFlair(post, single) {
  const isNSFW = isPostNSFW(post);

  const {
    distinguished,
    stickied,
    gilded,
    locked,
    promoted,
  } = post;

  if (!(stickied || (gilded && single) || distinguished || isNSFW || promoted)) {
    return null;
  }

  return (
    <span>
      { stickied ? STICKY_FLAIR : null }
      { locked ? LOCKED_FLAIR : null }
      { gilded && single ? GILDED_FLAIR : null }
      { gilded && single && gilded !== 1 ? gilded : null }
      { distinguished === 'moderator' ? MOD_FLAIR : null }
      { distinguished === 'admin' ? ADMIN_FLAIR : null }
      { isNSFW ? NSFW_FLAIR : null }
      { promoted ? SPONSORED_FLAIR : null }
    </span>
  );
}

function renderPostDescriptor(post, single, hideSubredditLabel, hideWhen) {

  const {
    distinguished,
    sr_detail,
    subreddit,
  } = post;

  const postFlairOrNil = renderPostFlair(post, single);
  const distinguishingCssClass = postTextColorClass(distinguished);
  const hasDistinguishing = !!distinguishingCssClass;
  const subredditLabelOrNil = subredditLabelIfNeeded(sr_detail, subreddit,
    hideSubredditLabel, hasDistinguishing);

  let authorOrNil;
  if (!single) {
    authorOrNil = renderAuthorAndTimeStamp(post, single, hideWhen);
  }

  return (
    <div className='PostHeader__post-descriptor-line'>
      <div className='PostHeader__post-descriptor-line-overflow'>
        <span className={ distinguishingCssClass }>
          { postFlairOrNil }
          { postFlairOrNil && subredditLabelOrNil ? SEPERATOR : null }
          { subredditLabelOrNil }
          { (postFlairOrNil || subredditLabelOrNil) && authorOrNil ? SEPERATOR : null }
          { authorOrNil }
        </span>
        { !single ? renderLinkFlairText(post) : null }
      </div>
    </div>
  );
}

function renderDetailViewSubline(post, hideWhen) {
  const {
    distinguished,
  } = post;

  const distinguishingCssClass = postTextColorClass(distinguished);
  return (
    <div className='PostHeader__post-descriptor-line'>
      <div className='PostHeader__post-descriptor-line-overflow'>
        <span className={ distinguishingCssClass }>
          { renderAuthorAndTimeStamp(post, true, hideWhen) }
          </span>
          { renderLinkFlairText(post) }
      </div>
    </div>
  );
}

function renderPostHeaderLink(post) {
  const url = mobilify(post.url);

  if (!url) {
    return;
  }

  return (
    <a className='PostHeader__post-link' href={ url } target='_blank'>
      { post.domain }
      <span className='PostHeader__post-link-icon icon-linkout blue' />
    </a>
  );
}

function renderPostTitleLink(post, single) {
  const url = single ? mobilify(post.url) : mobilify(post.cleanPermalink);
  const { title } = post;

  const titleLinkClass = `PostHeader__post-title-line ${post.visited ? 'm-visited' : ''}`;

  return (
    <a className={ titleLinkClass } href={ url } target={ single ? '_blank' : null }>
      { title }
    </a>
  );
}

export default function PostHeader(props) {
  const {
    post,
    single,
    hideSubredditLabel,
    hideWhen,
    nextToThumbnail,
    showingLink,
  } = props;

  return (
    <header className={ `PostHeader ${nextToThumbnail ? 'm-thumbnail-margin' : '' }` }>
      { renderPostDescriptor(post, single, hideSubredditLabel, hideWhen) }
      { renderPostTitleLink(post, single) }
      { showingLink ? renderPostHeaderLink(post) : null }
      { single ? renderDetailViewSubline(post, hideWhen) : null }
    </header>
  );
}
