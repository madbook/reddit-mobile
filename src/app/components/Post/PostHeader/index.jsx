import './styles.less';
import React from 'react';

import { Anchor } from 'platform/components';
import { short } from 'lib/formatDifference';
import mobilify from 'lib/mobilify';
import { getStatusBy, getApprovalStatus, sumReportsCount } from 'lib/modToolHelpers.js';
import PostModel from 'apiClient/models/PostModel';

import { LISTING_CLICK_TYPES } from 'app/constants';

import {
  isPostNSFW,
  cleanPostDomain,
  cleanPostHREF,
} from '../postUtils';

import OutboundLink from 'app/components/OutboundLink';
import { ModalBanner } from 'app/components/ModalBanner';

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

const SPOILER_FLAIR = (
  <span className='PostHeader__spoiler-text'>
    SPOILER
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

const APPROVED_FLAIR = (
  <span className='icon icon-check-circled green' />
);

const REMOVED_FLAIR = (
  <span className='icon icon-delete_remove ban-red' />
);

const SPAM_FLAIR = (
  <span className='icon icon-spam nsfw-salmon' />
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
  onElementClick: T.func.isRequired,
  titleOpensExpando: T.bool.isRequired,
};

function postTextColorClass(distinguished) {
  if (distinguished === 'moderator') { return 'PostHeader__mod-text'; }
  if (distinguished === 'admin') { return 'PostHeader__admin-text'; }
}

function isValidKeyColorForRendering(keyColor) {
  // in the future do something fancier with hsl compared to background color... maybe...
  return keyColor !== '#efefed' && keyColor !== '#222222';
}

function subredditLabelIfNeeded(sr_detail, subreddit, hideSubredditLabel,
    interceptListingClick) {
  if (hideSubredditLabel || !subreddit) { return; }

  const keyColorStyle = {};
  if (sr_detail && sr_detail.key_color) {
    if (isValidKeyColorForRendering(sr_detail.key_color)) {
      const { key_color } = sr_detail;
      Object.assign(keyColorStyle, { color: key_color});
    }
  }

  return (
    <Anchor
      className='PostHeader__subreddit-link'
      href={ sr_detail.url }
      style={ keyColorStyle }
      onClick={ e => interceptListingClick(e, LISTING_CLICK_TYPES.SUBREDDIT) }
    >
      { sr_detail.display_name_prefixed }
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

function renderAuthorAndTimeStamp(post, interceptListingClick, single, hideWhen, className) {
  const {
    author,
    createdUTC,
  } = post;

  const authorLink = (
    <Anchor
      className={ `PostHeader__author-link ${className}` }
      href={ `/user/${author}` }
      onClick={ e => interceptListingClick(e, LISTING_CLICK_TYPES.AUTHOR) }
    >
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
    spoiler,
  } = post;

  const showingGilded = gilded && single;

  if (!(stickied || showingGilded || distinguished === 'admin' || locked || isNSFW || promoted || spoiler)) {
    return null;
  }

  return (
    <span>
      { stickied ? STICKY_FLAIR : null }
      { locked ? LOCKED_FLAIR : null }
      { showingGilded ? GILDED_FLAIR : null }
      { showingGilded && gilded !== 1 ? gilded : null }
      { distinguished === 'admin' ? ADMIN_FLAIR : null }
      { isNSFW ? NSFW_FLAIR : null }
      { spoiler ? SPOILER_FLAIR : null }
      { promoted ? PROMOTED_FLAIR : null }
    </span>
  );
}

function renderModStatusFlair(post, reports) {
  const {
    approved,
    removed,
    spam,
    distinguished,
    locked,
    stickied,
  } = post;

  const reportCounts = sumReportsCount(reports);
  const REPORT_FLAIR = ([
    <span className={ `icon icon-flag ${ approved ? '' : 'warning-yellow' }` }/>,
    <span className={ `m-report-count ${ approved ? '' : 'warning-yellow' }` }> { reportCounts } </span>,
  ]);

  if (!(approved || removed || spam || locked || distinguished !== ''
      || stickied || reportCounts > 0)) {
    return null;
  }

  return (
    <span className='PostHeader__mod-status-flair'>
      { stickied ? STICKY_FLAIR : null }
      { distinguished === 'moderator' ? MOD_FLAIR : null }
      { locked ? LOCKED_FLAIR : null }
      { approved ? APPROVED_FLAIR : null }
      { removed ? REMOVED_FLAIR : null }
      { spam ? SPAM_FLAIR : null }
      { reportCounts > 0 ? REPORT_FLAIR : null }
    </span>
  );
}

function renderPromotedUserPostDescriptor({
    author,
    promotedUrl,
    promotedDisplayName,
  }, interceptListingClick) {
  const displayAuthor = promotedDisplayName || author;
  const urlProps = {
    className: 'PostHeader__promoted-user-post-line',
    href: promotedUrl,
    children: [
      <span className='PostHeader__megaphone blue icon icon-megaphone'/>,
      PROMOTED_FLAIR,
      <span className='blue'>{ ` by ${displayAuthor}` }</span>,
    ],
    onClick: e => interceptListingClick(e, LISTING_CLICK_TYPES.AUTHOR),
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
  interceptListingClick,
  single,
  renderMediaFullbleed,
  hideSubredditLabel,
  hideWhen,
  isPromotedUserPost,
  reports,
) {
  const {
    subredditDetail,
    subreddit,
  } = post;

  const postFlairOrNil = renderPostFlair(post, single);
  const subredditLabelOrNil = subredditLabelIfNeeded(subredditDetail, subreddit,
    hideSubredditLabel, interceptListingClick);

  let authorOrNil;
  if (!single) {
    authorOrNil = renderAuthorAndTimeStamp(post, interceptListingClick, single, hideWhen);
  }

  const flairOrNil = renderLinkFlairText(post);
  const promotedUserPostDescriptor = isPromotedUserPost && renderPromotedUserPostDescriptor(
    post,
    interceptListingClick
  );
  const normalPostDescriptor = renderWithSeparators([
    hideSubredditLabel && flairOrNil,
    postFlairOrNil,
    subredditLabelOrNil,
    renderMediaFullbleed && renderPostDomain(post),
    authorOrNil,
    !hideSubredditLabel && flairOrNil,
  ]);

  const modStatusFlair = renderModStatusFlair(post, reports);

  return (
    <div className='PostHeader__metadata-container'>
      <div className='PostHeader__post-descriptor-line'>
        <div className='PostHeader__post-descriptor-line-overflow'>
          <span
            children={
              isPromotedUserPost ? promotedUserPostDescriptor : normalPostDescriptor
            }
          />

        </div>
      </div>
      <div className='PostHeader__metadata'>
        { modStatusFlair }
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

function renderPostDomain(post, interceptListingClick) {
  return (
    <OutboundLink
      className='PostHeader__author-link'
      href={ mobilify(post.cleanUrl) }
      outboundLink={ post.outboundLink }
      onClick={ e => interceptListingClick(e, LISTING_CLICK_TYPES.DOMAIN) }
    >
      { cleanPostDomain(post.domain) }
    </OutboundLink>
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
        { renderAuthorAndTimeStamp(post, () => null, true, hideWhen, distinguishingCssClass) }
      </div>
    </div>
  );
}

function renderPostHeaderLink(post, interceptListingClick, showLinksInNewTab) {
  const href = cleanPostHREF(mobilify(post.cleanUrl));

  if (!href) {
    return;
  }

  const target = showLinksInNewTab ? '_blank' : null;

  return (
    <OutboundLink
      className='PostHeader__post-link'
      href={ href }
      target={ target }
      outboundLink={ post.outboundLink }
      onClick={ e => interceptListingClick(e, LISTING_CLICK_TYPES.TITLE) }
    >
      { cleanPostDomain(post.domain) }
      <span className='PostHeader__post-link-icon icon icon-linkout blue' />
    </OutboundLink>
  );
}

function renderPostTitleLink(
  post,
  interceptListingClick,
  showLinksInNewTab,
  onElementClick,
  titleOpensExpando,
  onTapExpand,
) {
  const linkExternally = post.promoted && !post.isSelf;
  const url = linkExternally ? post.cleanUrl : cleanPostHREF(mobilify(post.cleanPermalink));
  const { title } = post;

  const titleLinkClass = `PostHeader__post-title-line ${post.visited ? 'm-visited' : ''}`;
  const target = linkExternally && showLinksInNewTab ? '_blank' : null;

  const props = {
    className: titleLinkClass,
    href: url,
    target,
  };

  if (linkExternally) {
    //promoted posts have their own tracking
    return (
      <a { ...props }>
        { title }
      </a>
    );
  }

  const anchorProps = {
    ...props,
    onClick: e => {
      if (interceptListingClick(e, LISTING_CLICK_TYPES.TITLE)) {
        return;
      }

      if (titleOpensExpando) {
        e.preventDefault();
        const clickTarget = 'title';
        onTapExpand(clickTarget);
      }

      onElementClick();
    },
  };

  return (
    <Anchor { ...anchorProps }>
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
    interceptListingClick,
    nextToThumbnail,
    showingLink,
    renderMediaFullbleed,
    showLinksInNewTab,
    onElementClick,
    titleOpensExpando,
    onTapExpand,
    isSubredditModerator,
    reports,
  } = props;

  const showSourceLink = showingLink && !renderMediaFullbleed;
  const sizeClass = `${compact ? 'size-compact' : ''}`;
  const thumbnailClass = `${nextToThumbnail ? 'm-thumbnail-margin' : ''}`;
  const approvalStatus = getApprovalStatus(post.approved,
                                           post.removed,
                                           post.spam,);
  const statusBy = getStatusBy(post.approved,
                               post.removed,
                               post.spam,
                               post.bannedBy,
                               post.approvedBy);

  return (
    <header className={ `PostHeader ${sizeClass} ${thumbnailClass}` }>
      { single && isSubredditModerator
        ? <ModalBanner
          status={ approvalStatus }
          statusBy={ statusBy }
          pageName={ 'postHeader' }
          />
        : null
      }
      {
        renderPostDescriptor(
          post,
          interceptListingClick,
          single,
          renderMediaFullbleed,
          hideSubredditLabel,
          hideWhen,
          isPromotedUserPost,
          reports,
        )
      }
      { renderPostTitleLink(post, interceptListingClick, showLinksInNewTab,
                           onElementClick, titleOpensExpando, onTapExpand) }
      { showSourceLink
        ? renderPostHeaderLink(post, interceptListingClick, showLinksInNewTab)
        : null }
      { single && !isPromotedUserPost
        ? renderDetailViewSubline(post, interceptListingClick, hideWhen) : null }
    </header>
  );
}
