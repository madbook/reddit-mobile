import './styles.less';
import React from 'react';
import { Anchor } from '@r/platform/components';

import { short } from 'lib/formatDifference';
import mobilify from 'lib/mobilify';

import { models } from '@r/api-client';
const { PostModel } = models;

import {
  isPostNSFW,
  cleanPostDomain,
  cleanPostHREF,
} from '../postUtils';

const T = React.PropTypes;

const SEPERATOR = (
  <span className='PostHeader__seperator PostHeader__flush-w-icon' />
);

const NSFW_FLAIR = (
  <span className='PostHeader__nsfw-text'>
    <span className='icon icon-nsfw nsfw' />
    <span className='PostHeader__flush-w-icon'>NSFW</span>
  </span>
);

const STICKY_FLAIR = (
  <span className='icon icon-sticky green' />
);

const LOCKED_FLAIR = (
  <span className='icon icon-lock warning-yellow' />
);

const ADMIN_FLAIR = (
  <span className='icon icon-snoosilhouette orangered' />
);

const MOD_FLAIR = (
  <span className='icon icon-mod green' />
);

const GILDED_FLAIR = (
  <span className='icon icon-circled-gold gold' />
);

const PROMOTED_FLAIR = (
  <span className='PostHeader__promoted-flair'>PROMOTED</span>
);

PostHeader.propTypes = {
  post: T.instanceOf(PostModel),
  single: T.bool.isRequired,
  compact: T.bool.isRequired,
  hideSubredditLabel: T.bool.isRequired,
  hideWhen: T.bool.isRequired,
  nextToThumbnail: T.bool.isRequired,
  isPromotedUserPost: T.bool.isRequired,
  showingLink: T.bool.isRequired,
  renderMediaFullbleed: T.bool.isRequired,
  showLinksInNewTab: T.bool.isRequired,
};

function postTextColorClass(distinguished) {
  if (distinguished === 'moderator') { return 'PostHeader__mod-text'; }
  if (distinguished === 'admin') { return 'PostHeader__admin-text'; }
}

function isValidKeyColorForRendering(keyColor) {
  // in the future do something fancier with hsl compared to background color... maybe...
  return keyColor !== '#efefed' && keyColor !== '#222222';
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
    <Anchor
      className='PostHeader__subreddit-link'
      href={ `/${rSubreddit}` }
      style={ keyColorStyle }
    >
      { rSubreddit }
    </Anchor>
  );
}

function renderLinkFlairText(post) {
  if (!post.linkFlairText) {
    return;
  }

  return (
    <span className='PostHeader__link-flair' >
      { post.linkFlairText }
    </span>
  );
}

function renderAuthorAndTimeStamp(post, single, hideWhen) {
  const {
    author,
    createdUTC,
  } = post;

  const authorLink = (
    <Anchor className='PostHeader__author-link' href={ `/u/${author}` }>
      { `u/${author}` }
    </Anchor>
  );

  if (hideWhen) {
    return authorLink;
  }

  if (single) {
    return (
      <span>
        { authorLink }
        { SEPERATOR }
        { short(createdUTC) }
      </span>
   );
  }

  return (
    <span>
      { short(createdUTC) }
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

  const showingGilded = gilded && single;

  if (!(stickied || showingGilded || locked || distinguished || isNSFW || promoted)) {
    return null;
  }

  return (
    <span>
      { stickied ? STICKY_FLAIR : null }
      { locked ? LOCKED_FLAIR : null }
      { showingGilded ? GILDED_FLAIR : null }
      { showingGilded && gilded !== 1 ? gilded : null }
      { distinguished === 'moderator' ? MOD_FLAIR : null }
      { distinguished === 'admin' ? ADMIN_FLAIR : null }
      { isNSFW ? NSFW_FLAIR : null }
      { promoted ? PROMOTED_FLAIR : null }
    </span>
  );
}

function renderPromotedUserPostDescriptor({ author, promotedUrl, promotedDisplayName }) {
  const displayAuthor = promotedDisplayName || author;
  const urlProps = {
    className: 'PostHeader__promoted-user-post-line',
    href: promotedUrl,
    children: [
      <span className='PostHeader__megaphone blue icon icon-megaphone'/>,
      PROMOTED_FLAIR,
      <span className='blue'>{ ` by ${displayAuthor}` }</span>,
    ],
  };

  // no promoted url
  if (!promotedUrl) {
    return <span { ...urlProps } />;
  }
  // relative url
  if (promotedUrl[0] === '/') {
    return <Anchor { ...urlProps } />;
  }
  // absolute url or no url
  return <a { ...urlProps } />;
}

function renderPostDescriptor(
  post,
  single,
  renderMediaFullbleed,
  hideSubredditLabel,
  hideWhen,
  isPromotedUserPost,
) {
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

  const flairOrNil = renderLinkFlairText(post);
  const promotedUserPostDescriptor = isPromotedUserPost && renderPromotedUserPostDescriptor(post);
  const normalPostDescriptor = renderWithSeparators([
    hideSubredditLabel && flairOrNil,
    postFlairOrNil,
    subredditLabelOrNil,
    renderMediaFullbleed && renderPostDomain(post),
    authorOrNil,
    !hideSubredditLabel && flairOrNil,
  ]);

  return (
    <div className='PostHeader__post-descriptor-line'>
      <div className='PostHeader__post-descriptor-line-overflow'>
        <span
          className={ distinguishingCssClass }
          children={
            isPromotedUserPost ? promotedUserPostDescriptor : normalPostDescriptor
          }
        />
      </div>
    </div>
  );
}

function renderWithSeparators(nullableThings) {
  const separatedThings = [];

  nullableThings.forEach((thingOrNil) => {
    if (thingOrNil && separatedThings[separatedThings.length - 1]) {
      separatedThings.push(SEPERATOR);
    }

    if (thingOrNil) {
      separatedThings.push(thingOrNil);
    }
  });

  return separatedThings;
}

function renderPostDomain(post) {
  return (
    <a className='PostHeader__author-link' href={ mobilify(post.cleanUrl) }>
      { cleanPostDomain(post.domain) }
    </a>
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
      </div>
    </div>
  );
}

function renderPostHeaderLink(post, showLinksInNewTab) {
  const url = cleanPostHREF(mobilify(post.cleanUrl));

  if (!url) {
    return;
  }

  const target = showLinksInNewTab ? '_blank' : null;

  return (
    <a className='PostHeader__post-link' href={ url } target={ target }>
      { cleanPostDomain(post.domain) }
      <span className='PostHeader__post-link-icon icon icon-linkout blue' />
    </a>
  );
}

function renderPostTitleLink(post, showLinksInNewTab) {
  const linkExternally = post.disable_comments;
  const url = cleanPostHREF(mobilify(linkExternally ? post.url : post.cleanPermalink));
  const { title } = post;

  const titleLinkClass = `PostHeader__post-title-line ${post.visited ? 'm-visited' : ''}`;
  const target = linkExternally && showLinksInNewTab ? '_blank' : null;

  return (
    <Anchor className={ titleLinkClass } href={ url } target={ target }>
      { title }
    </Anchor>
  );
}

export default function PostHeader(props) {
  const {
    post,
    isPromotedUserPost,
    single,
    compact,
    hideSubredditLabel,
    hideWhen,
    nextToThumbnail,
    showingLink,
    renderMediaFullbleed,
    showLinksInNewTab,
  } = props;

  const showSourceLink = showingLink && !renderMediaFullbleed;
  const sizeClass = `${compact ? 'size-compact' : ''}`;
  const thumbnailClass = `${nextToThumbnail ? 'm-thumbnail-margin' : ''}`;
  return (
    <header className={ `PostHeader ${sizeClass} ${thumbnailClass}` }>
      {
        renderPostDescriptor(
          post,
          single,
          renderMediaFullbleed,
          hideSubredditLabel,
          hideWhen,
          isPromotedUserPost,
        )
      }
      { renderPostTitleLink(post, showLinksInNewTab) }
      { showSourceLink ? renderPostHeaderLink(post, showLinksInNewTab) : null }
      { single && !isPromotedUserPost ? renderDetailViewSubline(post, hideWhen) : null }
    </header>
  );
}
