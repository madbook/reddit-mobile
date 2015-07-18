import React from 'react';

var _listingSource = React.PropTypes.shape({
  url: React.PropTypes.string.isRequired,
});

var _listingResolutions = React.PropTypes.arrayOf(React.PropTypes.shape({
  width: React.PropTypes.number.isRequired,
  height: React.PropTypes.number.isRequired,
  url: React.PropTypes.string.isRequired,
}));

var _listingVariants = React.PropTypes.shape({
  nsfw: React.PropTypes.shape({
    resolutions: _listingResolutions.isRequired,
    source: _listingSource,
  })
});

export default {
  comment: React.PropTypes.shape({
    author: React.PropTypes.string.isRequired,
    author_flair_text: React.PropTypes.string,
    author_flair_css_class: React.PropTypes.string,
    body: React.PropTypes.string.isRequired,
    body_html: React.PropTypes.string.isRequired,
    created_utc: React.PropTypes.number.isRequired,
    distinguished: React.PropTypes.bool,
    gilded: React.PropTypes.number.isRequired,
    hidden: React.PropTypes.bool,
    id: React.PropTypes.string.isRequired,
    likes: React.PropTypes.oneOfType([
      React.PropTypes.bool,
      React.PropTypes.number,
    ]),
    link_title: React.PropTypes.string,
    link_url: React.PropTypes.string,
    name: React.PropTypes.string.isRequired,
    replies: React.PropTypes.oneOfType([
      React.PropTypes.array,
      React.PropTypes.string,
    ]).isRequired,
    saved: React.PropTypes.bool.isRequired,
    score: React.PropTypes.number.isRequired,
  }),
  listing: React.PropTypes.shape({
    _type: React.PropTypes.string.isRequired,
    author: React.PropTypes.string.isRequired,
    cleanPermalink: React.PropTypes.string.isRequired,
    created_utc: React.PropTypes.number.isRequired,
    distinguished: React.PropTypes.string,
    domain: React.PropTypes.string.isRequired,
    edited: React.PropTypes.oneOfType([
      React.PropTypes.bool,
      React.PropTypes.number,
    ]).isRequired,
    expandContent: React.PropTypes.string,
    gilded: React.PropTypes.number.isRequired,
    hidden: React.PropTypes.bool.isRequired,
    id: React.PropTypes.string.isRequired,
    is_self: React.PropTypes.bool.isRequired,
    likes: React.PropTypes.oneOfType([
      React.PropTypes.bool,
      React.PropTypes.number,
    ]),
    link_flair_css_class: React.PropTypes.string,
    link_flair_text: React.PropTypes.string,
    media: React.PropTypes.shape({
      oembed: React.PropTypes.shape({
        height: React.PropTypes.number.isRequired,
        html: React.PropTypes.string.isRequired,
        thumbnail_url: React.PropTypes.string.isRequired,
        type: React.PropTypes.string.isRequired,
        width: React.PropTypes.number.isRequired,
      }),
    }),
    name: React.PropTypes.string.isRequired,
    num_comments: React.PropTypes.number.isRequired,
    preview: React.PropTypes.shape({
      images: React.PropTypes.arrayOf(React.PropTypes.shape({
        source: _listingSource,
        variants: _listingVariants,
      })).isRequired,
      variants: _listingVariants,
      resolutions: _listingResolutions,
      source: _listingSource,
    }),
    over_18: React.PropTypes.bool.isRequired,
    promoted: React.PropTypes.bool,
    saved: React.PropTypes.bool.isRequired,
    selftext: React.PropTypes.string.isRequired,
    sr_detail: React.PropTypes.shape({
      icon_img: React.PropTypes.string,
      key_color: React.PropTypes.string,
    }),
    subreddit: React.PropTypes.string,
    thumbnail: React.PropTypes.string,
    title: React.PropTypes.string.isRequired,
    token: React.PropTypes.string,
    url: React.PropTypes.string.isRequired,
  }),
  subscriptions: React.PropTypes.arrayOf(React.PropTypes.shape({
    display_name: React.PropTypes.string.isRequired,
    icon: React.PropTypes.string,
    url: React.PropTypes.string.isRequired,
  })),
  user: React.PropTypes.shape({
    created: React.PropTypes.number.isRequired,
    is_mod: React.PropTypes.bool.isRequired,
    inbox_count: React.PropTypes.number,
    link_karma: React.PropTypes.number.isRequired,
    name: React.PropTypes.string.isRequired,
  }),
};
