import React from 'react';
import omit from 'lodash/omit';
import url from 'url';

import CommentModel from 'apiClient/models/CommentModel';
import PostModel from 'apiClient/models/PostModel';
import config from 'config';
import { cleanObject } from 'lib/cleanObject';
import safeStringify from 'lib/safeStringify';

const T = React.PropTypes;
const { reddit } = config;

const PARSED_REDDIT_URL = url.parse(reddit);
const { host: REDDIT_HOST, protocol: REDDIT_PROTOCOL }= PARSED_REDDIT_URL;

const GoogleCarouselMetadata = (props) => {
  const { post, comments, pageUrl } = props;
  // post, comments, and pageUrl all specify `isRequired` in their propTypes.
  // This makes it easier in debug to tell when we aren't passing in
  // data to this component. We still keep the explicit checks here
  // to ensure this component never errors (which could lead to GoogleBot seeing
  //  seeing a false 5XX error code, negatively affecting SEO).
  if (!post || !comments || !comments.length) {
    return null;
  }

  // TODO: this needs to set nonce on the script tag for csp-reporting
  return (
    <div dangerouslySetInnerHTML={ {
      __html: `
        <script type='application/ld+json'>
        ${safeStringify(commentsPageMetaData(pageUrl, post, comments))}
        </script>
      `,
    } } />
  );
};

GoogleCarouselMetadata.propTypes = {
  post: T.instanceOf(PostModel).isRequired,
  comments: T.arrayOf(T.instanceOf(CommentModel)).isRequired,
  pageUrl: T.string.isRequired,
};

export default GoogleCarouselMetadata;

const commentsPageMetaData = (pageUrl, post, comments) => ({
  '@context': 'http://schema.org',
  '@type': 'DiscussionForumPosting',
  url: addUtmTracking(desktopify(pageUrl)), // we rely on desktopify to ensure
  // the page url is prefixed with the cannonical reddit url, provided by config
  headline: post.title,
  datePublished: ISODate(post.createdUTC),
  author: {
    '@type': 'Person',
    name: post.author,
    url: `${reddit}/user/${post.author}/`,
  },

  // Post content info
  ...formatPostMediaContent(post),

  // comments
  commentCount: post.numComments,

  comment: {
    '@list': formatComments(comments),
  },
});

const formatPostMediaContent = post => {
  if (post.selfTextHTML) {
    return {
      articleBody: post.expandedContent,
    };
  } else if (post.media && post.media.oembed) {
    const embed = post.media.oembed;

    return {
      url: desktopify(embed.url || post.cleanUrl),
      thumbnailURL: firstPreviewUrl(post) || embed.thumbnail_url,
    };
  }

  return cleanObject({
    url: addUtmTracking(desktopify(post.cleanUrl)),
    thumbnailURL: firstPreviewUrl(post),
  });
};

export const firstPreviewUrl = post => {
  if (post.preview && Array.isArray(post.preview.images) && post.preview.images.length) {
    return post.preview.images[0].source.url;
  }
};

const formatComments = comments => (
  comments.filter(c => c && c.author).map(c => ({
    '@type': 'Comment',
    text: c.bodyHTML,
    datePublished: ISODate(c.createdUTC),
    author: {
      '@type': 'Person',
      name: c.author,
      url: `${reddit}/user/${c.author}/`,
    },
    commentCount: c.replies.length,
    aggregateRating: c.score,
  }))
);

const ISODate = utcSeconds => (new Date(utcSeconds * 1000)).toISOString();

export const isRedditDomain = hostName => hostName.endsWith('reddit.com');

export const addUtmTracking = urlString => {
  if (!urlString) { return urlString; }

  const urlObject = url.parse(urlString, true);
  if (!isRedditDomain(urlObject.hostname || '')) { return urlString; }

  return url.format({
    // url.format re-uses the search string instead of query object if it exists
    ...omit(urlObject, 'search'),
    query: { // we're appending utm params to the query. to do so we need to
      // splat the query object from the parsed url and add the utm params
      ...urlObject.query,
      utm_source: 'search',
      utm_medium: 'structured_data',
    },
  });
};


// Given a url string, returns the proper seo version for google carousel.
// A relative url is assumed to be a reddit url, i.e. if we get a url like
// '/r/javascript' it is turned into '<reddit>/r/javascript', where <reddit>
// is the base reddit url provided by config.
// A reddit url with a non-cannonical subdomain will be converted to use
// the correct subdomain (www). e.g. https://m.reddit.com will be turned into
// https://www.reddit.com
export const desktopify = urlString => {
  if (urlString) {
    const urlObject = url.parse(urlString);
    const { hostname } = urlObject;

    if (!hostname || hostname.endsWith('reddit.com')) {
      return url.format({
        ...urlObject,
        protocol: REDDIT_PROTOCOL, // match config's protocol or add to a relative url
        host: REDDIT_HOST, // match config's subdomain or add it to a relative url
      });
    }
  }

  return urlString;
};
