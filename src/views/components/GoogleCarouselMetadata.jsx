import React from 'react';
import moment from 'moment';
import has from 'lodash/object/has';

import mobilify from '../../lib/mobilify';
import propTypes from '../../propTypes';
import url from 'url';

export function isRedditDomain (hostname) {
  return hostname.endsWith('reddit.com');
}

/*
 * Adds UTM parameters to track inbound links from search engines.
 */
export function addUtmTracking (url_string) {
  if (!url_string) {
    return url_string;
  }

  const urlObject = url.parse(url_string, true);
  if (!isRedditDomain(urlObject.hostname)) {
    return url_string;
  }

  urlObject.query.utm_source = 'search';
  urlObject.query.utm_medium = 'structured_data';
  // node.url re-uses search string instead of query object if it exists
  delete urlObject.search;
  return url.format(urlObject);
}

function formatComments (comments, origin) {
  return comments.filter(c => c && c.author).map(function(c) {
    return {
      '@type': 'Comment',
      text: c.body_html,
      datePublished: moment(c.created_utc * 1000).format(),
      author: {
        '@type': 'Person',
        name: c.author,
        url: `${origin}/u/${c.author}`,
      },
      interactionCount: [
        {
          '@type': 'UserInteraction',
          userInteractionType: 'http://schema.org/UserComments',
          value: c.replies.length,
        },
        {
          '@type': 'UserInteraction',
          userInteractionType: 'http://schema.org/UserLikes',
          value: c.score,
        },
      ],
    };
  });
}

function GoogleCarouselMetadata (props) {
  const listing = props.listing;
  const comments = props.comments;

  if (!listing || !comments || comments.length === 0) {
    return (<div />);
  }

  const published = moment(listing.created_utc * 1000);

  const origin = props.origin;

  const baseObject = {
    '@context': 'http://schema.org',
    '@type': 'DiscussionForumPosting',
    url: addUtmTracking(origin + props.url),
    headline: listing.title,
    datePublished: published.format(),
    author: {
      '@type': 'Person',
      name: listing.author,
      url: `${origin}/u/${listing.author}`,
    },
    interactionCount: [{
      '@type': 'UserInteraction',
      userInteractionType: 'http://schema.org/UserComments',
      value: listing.num_comments,
    }],
    comment: {
      '@list': [],
    },
  };

  if (listing.selftext) {
    baseObject.articleBody = listing.expandcontent;
  } else if (listing.media && listing.media.oembed) {
    const embed = listing.media.oembed;

    baseObject.sharedContent = {
      url: mobilify(embed.url || listing.url, origin),
    };

    if (listing.preview && listing.preview.images[0]) {
      baseObject.sharedContent.thumbnail = listing.preview.images[0].source.url;
    } else {
      baseObject.sharedContent.thumbnail = embed.thumbnail_url;
    }
  } else {
    baseObject.sharedContent = {
      url: addUtmTracking(mobilify(listing.url, origin)),
    };

    if (has(listing, 'preview.images.0.source.url')) {
      baseObject.sharedContent.thumbnail = listing.preview.images[0].source.url;
    }
  }

  baseObject.comment['@list'] = formatComments(comments, props.origin);

  const googleScript = `
    <script type='application/ld+json' nonce=${props.nonce}>
      ${props.app.safeStringify(baseObject)}
    </script>
  `;

  return <div dangerouslySetInnerHTML={ { __html: googleScript } } />;
}

GoogleCarouselMetadata.propTypes = {
  comments: React.PropTypes.arrayOf(propTypes.comment).isRequired,
  // listing: propTypes.listing.isRequired, this one appears to be getting empty objects sometimes
  origin: React.PropTypes.string.isRequired,
};

export default GoogleCarouselMetadata;
