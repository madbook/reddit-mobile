import React from 'react';
import cookies from 'cookies-js';
import globals from '../../globals';
import mobilify from '../../lib/mobilify';
import moment from 'moment';

import BaseComponent from './BaseComponent';

class GoogleCarouselMetadata extends BaseComponent {
  constructor (props) {
    super(props);
  }

  shouldComponentUpdate (nextProps, nextState) {
    return false;
  }

  formatComments(comments) {
    let origin = this.props.origin;

    return comments.filter(function(c){ return c; }).map(function(c) {
      return {
        '@type': 'Comment',
        text: c.body_html,
        datePublished: moment(c.created_utc * 1000).format(),
        author: {
          '@type': 'Person',
          name: c.author,
          url: origin + '/u/' + c.author,
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

  render () {
    let props = this.props;

    let listing = props.listing;
    let comments = props.comments;

    if (!props.show || !listing || !comments || comments.length === 0) {
      return (<div />);
    }

    let published = moment(listing.created_utc * 1000);

    let origin = props.origin;

    let baseObject = {
      '@context': 'http://schema.org',
      '@type': 'DiscussionForumPosting',
      url: origin + globals().url,
      headline: listing.title,
      datePublished: published.format(),
      author: {
        '@type': 'Person',
        name: listing.author,
        url: origin + '/u/' + listing.author,
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
      let embed = listing.media.oembed;

      baseObject.sharedContent = {
        url: mobilify(embed.url || listing.url, origin),
      }

      if (listing.preview && listing.preview.images[0]) {
        baseObject.sharedContent.thumbnail = listing.preview.images[0].source.url;
      } else {
        baseObject.sharedContent.thumbnail = embed.thumbnail_url;
      }
    } else {
      baseObject.sharedContent = {
        url: mobilify(listing.url, origin),
      }

      if (listing.preview && listing.preview.images[0]) {
        baseObject.sharedContent.thumbnail = listing.preview.images[0].source.url;
      }
    }

    baseObject.comment['@list'] = this.formatComments(comments);

    let googleScript = `
      <script type='application/ld+json'>
        ${globals().app.safeStringify(baseObject)}
      </script>
    `;

    return <div dangerouslySetInnerHTML={{ __html: googleScript }} />;
  }
}

export default GoogleCarouselMetadata;
