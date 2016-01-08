import React from 'react';
import querystring from 'querystring';

import BaseComponent from './BaseComponent';

class ListingPaginationButtons extends BaseComponent {
  static propTypes = {
    compact: React.PropTypes.bool,
    prevUrl: React.PropTypes.string,
    nextUrl: React.PropTypes.string,
  };
  
  constructor(props) {
    super(props);

    this.state = {
      compact: this.props.compact,
    };
  }

  buildPrevUrl () {
    const {
      pagingPrefix = '',
      listings,
      ctx,
    } = this.props;

    const firstId = listings[0].name;
    const page = parseInt(ctx.query.page || 0);

    if (page > 0) {
      const prevQuery = {
        ...ctx.query,
        count: 25,
        page: page - 1,
        before: firstId,
        after: undefined,
      };

      return `${pagingPrefix}?${querystring.stringify(prevQuery)}`;
    }
  }

  buildNextUrl () {
    const props = this.props;
    const { listings, ctx, pagingPrefix } = props;
    const lastId = listings[listings.length - 1].name;
    const page = parseInt(ctx.query.page || 0);

    const nextQuery = {
      ...props.ctx.query,
      count: 25,
      page: page + 1,
      after: lastId,
      before: undefined,
    };

    return `${pagingPrefix || ''}?${querystring.stringify(nextQuery)}`;
  }

  render() {
    const compact = this.state.compact;

    // Allow overriding for special cases, like search. Otherwise, fall back to
    // the default logic for building next/previous urls.
    let { prevUrl, nextUrl } = this.props;

    if (!prevUrl) {
      prevUrl = this.buildPrevUrl();
    }

    if (!nextUrl) {
      nextUrl = this.buildNextUrl();
    }

    let prevButton;
    let nextButton;

    if (prevUrl) {
      prevButton = (
        <a href={ prevUrl } rel='prev' className='btn btn-sm btn-primary IndexPage-button prev'>
          <span className='glyphicon glyphicon-chevron-left'></span>
            Previous Page
        </a>
      );
    }

    if (nextUrl) {
      nextButton = (
        <a href={ nextUrl } rel='next' className='btn btn-sm btn-primary IndexPage-button next'>
          Next Page
          <span className='glyphicon glyphicon-chevron-right'></span>
        </a>
      );
    }

    return (
      <div className='pageNav IndexPage-buttons-holder-holder'>
        <div className='col-xs-12 IndexPage-buttons-holder'>
           <p className={ 'IndexPage-buttons' + (compact ? ' compact' : '') }>
              { prevButton } { nextButton }
            </p>
        </div>
      </div>
    );
  }
}

export default ListingPaginationButtons;
