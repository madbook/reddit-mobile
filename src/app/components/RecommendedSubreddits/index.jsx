import './styles.less';

import url from 'url';
import React from 'react';
import { Anchor } from '@r/platform/components';

import cx from 'lib/classNames';

export default function RecommendedSubreddits(props) {
  const { recommendedSubreddits, cssClass, variant, currentSubreddit } = props;

  let subredditListing, subredditHeader;

  let title = [
    <div className='RecommendedSubreddits__title'>
      <div className='title-text'>Recommended Communities</div>
    </div>,
    <hr/>,
  ];

  if (variant === 'topPlain') {
    subredditListing = recommendedSubreddits.map((sr, index) => {
      return (
        <div className={ cssClass }>
          <Anchor
            href={ addUtmTracking(sr.url, index, variant) }
            className='sr-url'
          >
            { formatSubredditHref(sr.url) }
          </Anchor>
        </div>
      );
    });
  } else if (variant === 'subredditHeader') {
    title = null;
    subredditHeader = true;
    subredditListing = (
      <div className={ cssClass }>
        <Anchor
          href={ addUtmTracking(currentSubreddit.url, 0, variant) }
          className='sr-url'
        >
          See more at { formatSubredditHref(currentSubreddit.url) }
        </Anchor>
      </div>
    );
  } else {
    subredditListing = recommendedSubreddits.map((sr, index) => {
      return (
        <div className={ cssClass }>
          <div
            className='subreddit-icon-image'
            style={ sr.iconImage
                    ? { 'backgroundImage': `url(${sr.iconImage})`,
                        'backgroundPosition': '-1px 0px' }
                    : {}
                  }
          />
          <Anchor
            href={ addUtmTracking(sr.url, index, variant) }
            className='sr-url'
          >
            { formatSubredditHref(sr.url) }
          </Anchor>
          <div className='sr-subscriber-count'>
            { Number(sr.subscribers).toLocaleString('en') +
              (sr.subscribers > 1 ? ' subscribers' : ' subscriber') }
          </div>
        </div>
      );
    });
  }

  return (
    <div className={ cx('RecommendedSubreddits__container',
                       { 'sr-header' : subredditHeader }) }>
      { title }
      { subredditListing }
    </div>
  );
}


const addUtmTracking = (urlString, position, variant) => {
  const urlObject = url.parse(urlString, true);

  return url.format({
    pathname: urlObject.pathname,
    query: { // we're appending utm params to the query. to do so we need to
      // splat the query object from the parsed url and add the utm params
      ...urlObject.query,
      utm_source: 'mweb',
      utm_medium: 'sr_recommendations',
      utm_name: 'experiment_70',
      utm_content: position,
      utm_term: variant,
    },
  });
};

const formatSubredditHref = (url) => {
  // remove leading & trailing slash if they exist
  return url.replace(/^\//, '').replace(/\/$/, '');
};
